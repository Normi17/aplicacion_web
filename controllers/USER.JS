const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

//Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  //validacion
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Por favor, rellene todos los campos obligatorios");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("La contraseÃ±a debe tener minimo 6 caracteres");
  }
  //verificar si el usuario existe
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("El correo electrÃ³nico ya ha sido registrado");
  }
  //crear usuario
  const user = await User.create({
    name,
    email,
    password, 
  });
  //Generar Token
  const token = generateToken(user._id);
  if (user) {
    const { _id, name, email, role } = user;
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
    });
    res.status(201).json({
      _id,
      name,
      email,
      role,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Datos invalidos del usario");
  }
  res.send("registered user")
}); 

//Login User
const loginUser = asyncHandler(async(req, res)=> {
  const {email, password} = req.body;
  // validaar respuesta
  if (!email || !password) {
    res.status(400);
    throw new  Error("Please provide an email and a password");
  }
  // Verificar si el usuario existe
  const user =  await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User doesnt no exist");
  }
  //si el usuario existe. verificar si el password es correcto
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  //generar token
  const token = generateToken(user._id);
  if (user && passwordIsCorrect) {
    const newUser = await User.findOne({email}).select("-password");
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
    });
    res.status(201).json(newUser);
    
  }else{
    res.status(400);
    throw new Error("Invalid email or password");
  }

  res.send("Login user")
});

const logout = asyncHandler(async(req, res) =>{
  res.cookie("token", "",{
    path:"/",
    httpOnly: true,
    expires: new Date(0),

  }),
  res.status(200).json({message: "Se ah cerrado la sesiÃ³n con exito "})

});

const getUser = asyncHandler(async(req, res)=>{
  const user = await User.findById(req.user._id).select("-password");
  if(user){
    res.status(200).json(user);
  }else{
    res.status(400);
    throw new Error("User  not found");
  }
});

const getLoginStatus = asyncHandler(async(req, res)=>{
  const token = req.cookies.token;
  if (!token) {
    return res.json(false)
  }
  //verificar token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    res.json(true)
  }else{
    res.json(false)
  }
});
//update user
const updateUser = asyncHandler(async(req, res)=>{
  const user = await User.findById(req.user._id);
  if (user) {

    const {name, phone, address} = user;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.address = req.body.address || address;

    const updatedUser = await user.save();
    res.status(200).json(updatedUser)
  }else{
    res.status(404);
    throw new Error("Usuario no encontrado")
  }
});
const updatePhoto = asyncHandler(async(req, res)=>{
  const {photo} = req.body;
  const user = await User.findById(req.user._id);
  user.photo  = photo;
  const updatedUser = await  user.save();
  res.status(200).json(updatedUser);
})

module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  getLoginStatus,
  updateUser,
  updatePhoto
};  
