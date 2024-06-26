const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const getUserByNameAdmin =
  require("../dataAccess/registrationAndLoginDataAccess").getUserByNameAdmin
const getUserByName =
  require("../dataAccess/registrationAndLoginDataAccess").getUserByName
const generateAcessToken = require("../utils/generateAccessToken")

router.post("/admin", async (req, res) => {
  const { apikey } = req.headers

  if (apikey !== process.env.ADMIN_API_KEY) {
    return res
      .status(401)
      .send({ msg: "You are not authorized to perform this action" })
  } else {
    const { username, password } = req.body

    if (!username || !password) {
      return res
        .status(400)
        .send({ msg: "Please provide username and password" })
    }

    const checkUser = await getUserByNameAdmin(username)

    if (checkUser.length === 0) {
      return res.status(400).send({ msg: "User does not exist.Please sign up" })
    }

    const validPassword = await bcrypt.compare(password, checkUser[0].password)
    if (!validPassword) {
      return res.status(400).send({ msg: "Invalid password" })
    }

    res.status(200).send({
      msg: "Login successful",
      username: checkUser[0].username,
      role: checkUser[0].role,
      id: checkUser[0].id,
    })
  }
})

router.post("/user", async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).send({ msg: "Please provide username and password" })
  }

  const checkUser = await getUserByName(username)

  if (checkUser.length === 0) {
    return res.status(400).send({ msg: "User does not exist.Please sign up" })
  }

  const validPassword = await bcrypt.compare(password, checkUser[0].password)
  if (!validPassword) {
    return res.status(400).send({ msg: "Invalid password" })
  }

  const token = generateAcessToken(username, checkUser[0].id)

  res.status(200).send({
    msg: "Login successful",
    username: checkUser[0].username,
    role: checkUser[0].role,
    id: checkUser[0].id,
    token,
  })
})

module.exports = router
