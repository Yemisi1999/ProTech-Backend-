import Users from '../models/user.js';
import { UserToken } from '../models/token.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';
import { registerValidation, loginValidation } from '../validations/userValidation.js';
import { StatusCodes } from 'http-status-codes';
import  jwt from 'jsonwebtoken';
import { error } from 'console';
    


const  registerUser= async(req, res) => {
    try {
        const { username, email, password } = req.body;

    // check if all fields are not empty
    if (!username || !email || !password) {
      return res.json({
        message: 'All fields are required',
        status: 400,
        success: false,
      });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    // check for valid email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.json({
        message: 'Invalid input for email...',
        success: false,
        status: 400,
      });
    }

    // check the fullName field to prevent input of unwanted characters
    if (!/^[a-zA-Z0-9 -]+$/.test(trimmedUsername)) {
      return res.json({
        message: 'Invalid input for fullName...',
        status: 400,
        success: false,
      });
    }

    // strong password check
    if (
      !/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/.test(
        password
      )
    ) {
      return res.json({
        message:
          'Password must contain at least 1 special character, 1 lowercase letter, and 1 uppercase letter. Also it must be minimum of 8 characters and maximum of 20 characters',
        success: false,
        status: 401,
      });
    }

    // check if email exist
    const emailExist = await Users.findOne({ email });
        console.log(emailExist)
        
        if(emailExist) {
            return res.status(StatusCodes.BAD_REQUEST).send('Email already exists');
        }

        // Hash passwords
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = await new Users({
            username: username,
            email: email,
            password_hash: hashedPassword,
        }).save();

        // generate email verification link and send
        const token =
        crypto.randomBytes(32).toString('hex') +
        crypto.randomBytes(32).toString('hex');

        const newToken = await new UserToken({
            userId: newUser._id,
            token,
        }).save();

        const link = `${process.env.FRONTEND}/api/users/confirm/${newToken.userId}/${newToken.token}`;
    
        // send email verification link to patient email address using nodemailer
        await sendEmail(newUser.email, link);
        console.log('Recipient email:', newUser.email);

        return res.json({
            message: 'Please open your email to verify your email',
            success: true,
        });

    } catch (err) {
        // console.log(err)
        return res.json({
            message: 'Something happened',
            status: 500,
            success: false,
        });
    }
    
   
}

const verifyUserEmail = async (req, res) => {
  try {
    const { userId, token } = req.params;

    const tokenExist = await UserToken.findOne({
      token: token,
      userId: userId,
    });
    // console.log(token, userId)

    if (!tokenExist) {
      // console.log(error)
      return res.json({
        message: 'Token can not be found',
        success: false,
        status: 404,
      });
    }

    const userExist = await Users.findByIdAndUpdate(
      userId.toString(),
      {
        $set: {
          isVerified: true,
        },
      },
      { new: true }
    );

    if (!userExist) {
      return res.json({
        message: 'User can not be found',
        status: 404,
        success: false,
      });
    }

    const deleteToken = await tokenExist.deleteOne();

    return res.json({
      message: 'Email verification successful',
      status: 200,
      success: true,
    });
  } catch (error) {
      console.log(error)
    return res.json({
      message: 'Something happened',
      status: 500,
      success: false,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        message: 'All fields are required...',
        status: 400,
        success: false,
      });
    }

    const trimmedEmail = email.trim();

    // check for valid email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.json({
        message: 'Invalid input for email...',
        success: false,
        status: 400,
      });
    }

    // strong password check
    if (
      !/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/.test(
        password
      )
    ) {
      return res.json({
        message:
          'Password must contain at least 1 special character, 1 lowercase letter, and 1 uppercase letter. Also it must be minimum of 8 characters and maximum of 20 characters',
        success: false,
        status: 401,
      });
    }

    const user = await Users.findOne({ email });

    if (!user) {
      return res.json({
        message: 'Invalid credentials',
        status: 404,
        success: false,
      });
    }

    const validatePassword = await bcrypt.compare(password, user.password_hash);

    if (!validatePassword) {
      return res.json({
        message: 'Invalid credentials',
        success: false,
        status: 404,
      });
    }

    // check if patient has a verified email
    if (user.isVerified === false) {
      // check whether he has token
      const token = await UserToken.findOne({
        userId: user._id,
      });

      if (token) {
        return res.json({
          message: 'Please verify the mail sent to you',
        });
      }
      // generate another token
      const createToken =
        crypto.randomBytes(32).toString('hex') +
        crypto.randomBytes(32).toString('hex');

      const newToken = await UserToken({
        token: createToken,
        userId: user._id,
      }).save();

      const link = `${process.env.FRONTEND}/api/users/confirm/${newToken.userId}/${newToken.token}`;

      sendEmail(user.email, link);
      return res.json({
        message:
          'Please check your email for the verification link sent to you',
      });
    }

    // Create and assign a token
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});

    res.header('auth-token', token);

    return res.json({
      message: 'Login successful',
      success: true,
      status: 200,
      token: token
    });

  } catch (error) {
    console.log(error)
    return res.json({
      message: 'Something happened',
      success: false,
      status: 500,
    });
  }
};

export { 
    registerUser,
    verifyUserEmail,
    loginUser
}