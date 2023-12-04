const userM = require("../../models/users.m");
const CryptoJS = require("crypto-js");
const hashLength = 64;
const sendMail = require("../../utils/sendEmail.u");
const tokenM = require("../../models/token.m");
const jwt = require("jsonwebtoken");
const my_cloudinary = require("../../configs/myCloudinary");

module.exports = {
  render: async (req, res, next) => {
    try {
      return res.render("test");
    } catch (error) {
      next(error);
    }
  },
  signIn: async (req, res, next) => {
    try {
      const user = req.body;
      userM.getByEmail(user.email).then((rs) => {
        if (rs.length === 0) {
          // check username
          res.json({ message: "Email or password incorrect" });
          //TODO: show error message
        } else {
          // check password
          const pwDb = rs[0].password;
          const salt = pwDb.slice(hashLength);
          const pwSalt = user.password + salt;
          const pwHashed = CryptoJS.SHA3(pwSalt, {
            outputLength: hashLength * 4,
          }).toString(CryptoJS.enc.Hex);
          if (pwDb !== pwHashed + salt) {
            //TODO: show error message
            return res.json({ message: "Email or password incorrect" });
          }

          // check account is valid
          if (rs[0].active == false) {
            //TODO: show error message
            return res.json({ message: "Your account is not active" });
          }

          // all good
          req.session.uid = rs[0].userId;
          req.session.email = rs[0].email;

          // TODO: redirect to home page
          // return res.redirect("/");
          return res.json({ message: "Login successful" });
        }
      });
    } catch (error) {
      next(error);
    }
  },
  signOut: async (req, res, next) => {
    try {
      req.session.uid = null;
      req.session.email = null;
      // TODO: redirect to login page
      res.redirect("/");
    } catch (error) {
      next(error);
    }
  },
  signup: async (req, res, next) => {
    try {
      let newUser = req.body;
      const pw = newUser.password;
      userM.getByEmail(newUser.email).then(async (rs) => {
        if (rs.length === 0) {
          // don't have user with email
          const salt = Date.now().toString(16);
          const pwSalt = newUser.password + salt;
          const pwHashed = CryptoJS.SHA3(pwSalt, {
            outputLength: hashLength * 4,
          }).toString(CryptoJS.enc.Hex);
          newUser.password = pwHashed + salt;
          newUser.avatar = `https://robohash.org/${newUser.email}.png?set=set4`;

          // new user
          userM.add(newUser);
          // send mail
          await sendMail.sendMail(newUser.email);

          // TODO: render success page
          return res.json({ message: "User created successfully" });
        } else {
          newUser.password = pw;

          // TODO: re-render register page with error
          return res.json({ message: "Email is existing" });
        }
      });
    } catch (error) {
      next(error);
    }
  },
  verifyAccount: async (req, res, next) => {
    try {
      const { token } = req.params;
      const rs = await tokenM.getToken(token);
      if (rs.length === 0) {
        throw new Error("Invalid Token");
      } else {
        const user = await jwt.verify(token, process.env.JWT_SECRET);
        const haveAcc = await userM.getByEmail(user.email);
        if (haveAcc.length === 0) {
          throw new Error("Invalid Email");
        } else {
          await userM.updateActiveAccount(haveAcc[0].userId);
          await tokenM.delete(rs[0].codeId);
          // req.session.uid = haveAcc[0].userId;
          // req.session.email = haveAcc[0].email;
          res.send("Verified email");
        }
      }
    } catch (error) {
      next(error);
    }
  },
  edit: async (req, res, next) => {
    try {
      const user = (await userM.getByEmail("haonhat2729@gmail.com"))[0];
      const { name, phoneNumber } = req.body;
      user.name = name;
      user.phoneNumber = phoneNumber;
      if (req.file?.path) {
        if (user.public_id) {
          await my_cloudinary.destroy(user.public_id);
        }
        try {
          const { url, public_id } = await my_cloudinary.push(req.file.path);
          user.avatar = url;
          user.public_id = public_id;
        } catch (error) {
          next(error);
        }
      }
      await userM.update(user);
      return res.json({ succes: true, message: "Updated user successfully" });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const haveUser = await userM.getByID(req.params?.id);
      // check if product don't already exist
      if (haveUser.length <= 0) {
        return res.status(400).json({ message: "User ID invalid" });
      }

      await my_cloudinary.destroy(haveUser[0].public_id);
      const rs = await userM.delete(req.params?.id);
      return res.json(rs);
    } catch (error) {
      next(error);
    }
  },
};
