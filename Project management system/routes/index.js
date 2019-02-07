var express = require("express");
var router = express.Router();

var session = require('express-session');
var loginSession;

router.use(session({
    secret: 'ssshhhhh',
    resave: false,
    saveUninitialized: false
}));
//import all controller
var userController = require("../controller/userController");
var boardController = require("../controller/boardController");

/* route for login and register */
router.get("/", userController.getlogin);
router.get("/register", userController.getRegister);
router.post("/register", userController.addUser);
router.post("/login", userController.login);

// route for board
router.get("/dashboard", boardController.allBoards);
router.get("/showAddBoardForm", boardController.addBoardView);
router.post("/addBoard", boardController.createBoard);
router.get("/editBoardView/:id", boardController.editBoardView);
router.post("/editBoard", boardController.updateBoard);
router.get("/deleteBoard/:id", boardController.removeBoard);
router.get("/board/:id", boardController.boardDetails);

// route for list
router.post("/addList", boardController.createList);
router.post("/editList", boardController.updateList);
router.post("/deleteList", boardController.deleteList);

// route for card
router.post("/addCard", boardController.addCardToList);
router.post("/editCard", boardController.editCardFromList);
router.post("/deleteCard", boardController.deleteCardFromList);

// route for member
router.get("/manageMember/:id", boardController.manageMemberList);
router.post("/addMember", boardController.addMember);
router.post("/deleteUser", boardController.removeMember);



module.exports = router;
