const mongoose = require("mongoose");
const Board = require("../model/boardModel");
const User = require("../model/userModel");


/***************************************************************************************
* This function display all boards which user have created or is a member of.
***************************************************************************************/
async function allBoards(req, res) {
    console.log("in all boards");
    let query = { $and: [] };
    loginSession = req.session;
    var userId = loginSession.userId;
    query.$and.push({ status: true }, { $or: [{ createdBy: userId }, { "users.user": userId }] });
    try {
        let listBoards = await Board.find(query).exec();
        res.render("dashboard", { list: listBoards });
    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.render("dashboard", { err: errMsg });
    }
}

/***************************************************************************************
* This function to display board view
***************************************************************************************/
async function addBoardView(req, res) {
    res.render("addBoard");
}

/***************************************************************************************
* This function to add board
***************************************************************************************/
async function createBoard(req, res) {

    try {
        // gets userid from session to get id of logged in user 
        loginSession = req.session;
        var userId = loginSession.userId;

        var boardDetails = {
            title: req.body.boardTitle,
            description: req.body.boardDescription,
            createdBy: userId,
            status: true
        };

        let boardData = new Board(boardDetails);
        let board = await boardData.save();
        res.redirect("../dashboard");
    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.redirect("../addBoard", { err: errMsg });
    }
}

/***************************************************************************************
* This function to fetch details of one board for update
***************************************************************************************/
async function editBoardView(req, res) {
    let query = { $and: [] };
    query.$and.push({ status: true });
    try {
        if (req.params.id) {
            query.$and.push({ _id: req.params.id });
        }
        let boardDetails = await Board.findOne(query).exec();
        res.render("editBoard", { boardDetails });
    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.render("editBoard", { error: errMsg });
    }
}

/***************************************************************************************
* This function to update board
***************************************************************************************/
async function updateBoard(req, res) {
    let data = req.body;
    try {
        let boardData = await Board.findOneAndUpdate({ _id: data.id },
            { $set: { title: data.title, description: data.description } }, { new: true }).exec();
        res.render("boardDetails", { boardData });
    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.redirect("boardDetails", { error: errMsg });
    }
}

/***************************************************************************************
* This function remove the board
***************************************************************************************/
async function removeBoard(req, res) {
    try {
        let boardDel = await Board.deleteOne(
            { _id: req.params.id }
        ).exec();
        let list = await Board.find({ status: true }).exec();
        res.render("dashboard", { list, boardDel });
    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.render("boardDetails", { err: errMsg });
    }
}

/***************************************************************************************
* This function to fetch details of one board
***************************************************************************************/
async function boardDetails(req, res) {
    let query = { $and: [] };
    query.$and.push({ status: true });

    try {
        if (req.params.id) {
            query.$and.push({ _id: req.params.id });
        }
        let list = await Board.findOne(query).exec();

        res.render("boardDetails", { boardData: list });
    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.render("dashboard", { err: errMsg });
    }
}

// LIST
/**********************************************************************************************
//function to display list view
***********************************************************************************************/
async function addListView(req, res) {
    let id = req.params.id;
    res.render("addList", { boardId: id });
}

/**********************************************************************************************
//function to add list in selected board
***********************************************************************************************/
async function createList(req, res) {
    let query = { $and: [] };
    query.$and.push({ status: true });

    try {
        let data = req.body;
        let boardData = await Board.findOneAndUpdate(
            { _id: data.boardId },
            { $push: { list: data } },
            { new: true }
        ).exec();
        // on successfully adding list  render board Details 
        res.render("boardDetails", { boardData, listAdd: true });

    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.render("boardDetails", { error: errMsg });
    }
}
/******************************************************************************************
//function to update list in board
*****************************************************************************************/
async function updateList(req, res) {
    console.log("In updateList");
    let query = { $and: [] };
    query.$and.push({ status: true });
    try {
        let listUpd = await Board.updateOne(
            { "list._id": req.body.list },
            { $set: { "list.$.title": req.body.title } }
        ).exec();

        query.$and.push({ _id: req.body.board });
        let boardData = await Board.findOne(query).exec();

        res.render("boardDetails", { boardData, listUpd });

    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.render("boardDetails", { error: errMsg });
    }
}

/******************************************************************************************
 *  Function to delete list from particular board
*******************************************************************************************/
async function deleteList(req, res) {
    console.log("In deleteList");
    let query = { $and: [] };
    query.$and.push({ status: true });
    try {
        let listDel = await Board.updateOne(
            { _id: req.body.board },
            { $pull: { list: { _id: req.body.list } } }
        ).exec();

        query.$and.push({ _id: req.body.board });
        let boardData = await Board.findOne(query).exec();

        res.render("boardDetails", { boardData, listDel });

    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.render("boardDetails", { error: errMsg });
    }
}

/******************************************************************************************
//function to add card to list in the board
*****************************************************************************************/
async function addCardToList(req, res) {
    console.log("In addCardToList-----------");
    try {
        let data = {
            title: req.body.title
        };
        var listData = await Board.findOneAndUpdate(
            { "list._id": req.body.list },
            { $push: { 'list.$.cards': data } },
            { new: true }
        ).exec();
        let dataNew = listData.list.find(item => item.id === req.body.list);
        let cardNew = dataNew.cards[dataNew.cards.length - 1];
        res.json({ cardData: cardNew });
    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.render("boardDetails", { error: errMsg });
    }
}

/******************************************************************************************
//function to edit card to list in the board
*****************************************************************************************/
async function editCardFromList(req, res) {
    console.log("In editCardFromList");
    // debugger;
    try {
        var listData = await Board.findById(
            { "_id": req.body.boardId }
        ).exec();
        let listIndex = listData.list.findIndex(item => item._id == req.body.list);
        let cardIndex = listData.list[listIndex].cards.findIndex(item => item._id == req.body.cardId);

        let update = { "$set": {} };
        update["$set"]["list." + listIndex + ".cards." + cardIndex + ".title"] = req.body.cardTitle;
        var cardUpd = await Board.updateOne({ "_id": req.body.boardId }, update
        ).exec();

        if (cardUpd) {
            res.json({ cardData: cardUpd });
        }

    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.render("boardDetails", { error: errMsg });
    }
}


/***************************************************************************************
* This function to delete card from list
***************************************************************************************/
async function deleteCardFromList(req, res) {
    console.log("In deleteCardFromList");
    try {
        let cardDel = await Board.updateOne(
            { 'list._id': req.body.listId },
            { $pull: { 'list.$.cards': { _id: req.body.cardId } } }
        ).exec();

        res.json({ cardData: cardDel });

    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.render("boardDetails", { error: errMsg });
    }
}
// MANAGE MEMBER

/***************************************************************************************
* This function to list members of the board
***************************************************************************************/
async function manageMemberList(req, res) {
    try {
        // based on board id, gets board data and populate values in created by,
        // added by and user with id, email,first name, last name
        let boardUsers = await Board.findOne({ _id: req.params.id }).populate({
            path: 'createdBy',
            model: 'User',
            select: ['_id', 'email', 'first_name', 'last_name']
        }).populate({
            path: 'users.user',
            model: 'User',
            select: ['user', 'email', 'first_name', 'last_name'],
        }).populate({
            path: 'users.addedBy',
            model: 'User',
            select: ['_id', 'email', 'first_name', 'last_name']
        }).exec();

        if (boardUsers) {
            var boardRegUsers = JSON.parse(JSON.stringify(boardUsers))//{ ...boardUsers };
            let userArr = [];
            // iterates in each user obj in array to set unshare property: true if user have added that particular user
            // and creates a array of all users who are part of the board(added by and members of board)
            // to populate users to add in add form
            boardRegUsers.users.forEach(function (item) {
                userArr.push(item.user._id);
                if (item.addedBy._id == req.session.userId)
                    item.unshare = true;
                else
                    item.unshare = false;
            });
            userArr.push(boardRegUsers.createdBy._id);
            let userData = await User.find({
                _id: {
                    $nin: userArr
                }
            }).exec();

            res.render("manageMember", { boardData: boardRegUsers, userData });
        }
    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.redirect("manageMember", { error: errMsg });
    }
}

/***************************************************************************************
* This function adds the member to the board 
***************************************************************************************/
async function addMember(req, res) {
    let query = { $and: [] };

    try {

        loginSession = req.session;
        let data = {
            user: req.body.email,
            addedBy: loginSession.userId
        }
        // based on board id update users array
        let boardData = await Board.findOneAndUpdate(
            { _id: req.body.boardId },
            { $push: { users: data } },
            { new: true }
        ).exec();

        if (boardData) {
            // recently added
            let userDataSingle = boardData.users[boardData.users.length - 1];
            let userData = JSON.parse(JSON.stringify(userDataSingle));
            // checks if the user was added by logged in user, if yes then it sets unshare property
            // so that user can be shown button to unshare that user.
            if (userData.addedBy == req.session.userId)
                userData.unshare = true;
            else
                userData.unshare = false;

            res.json({ userData });
        }
    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.render("addMember", { error: errMsg });
    }
}

/***************************************************************************************
* This function remove the member from the board 
***************************************************************************************/
async function removeMember(req, res) {
    console.log("In removeMember");
    try {
        let userDel = await Board.updateOne(
            { _id: req.body.board },
            { $pull: { users: { _id: req.body.row } } }
        ).exec();

        // sends json 
        res.json({ userData: userDel });

    } catch (err) {
        var errMsg = "There was Error " + err + "\n";
        res.render("boardDetails", { error: errMsg });
    }
}
module.exports = {
    allBoards,
    addBoardView,
    createBoard,
    editBoardView,
    updateBoard,
    removeBoard,
    boardDetails,
    addListView,
    createList,
    updateList,
    deleteList,
    addCardToList,
    editCardFromList,
    deleteCardFromList,
    manageMemberList,
    addMember,
    removeMember
};
