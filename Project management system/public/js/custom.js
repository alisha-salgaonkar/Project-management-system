/***************************************************************************************
* This file contains custom functions and click handlers *
 ***************************************************************************************/

$(document).ready(function () {

    /***************************************************************************************
    * This function shows modal dialog showing editform to edit list
    ***************************************************************************************/
    $('#editListModal').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget) // Button that triggered the modal
        let listId = button.data('list');
        let modal = $(this);
        let title = $.trim($(button)[0].previousSibling.data);
        modal.find('#list').val(listId);
        modal.find('#title').val(title)
    });


    /***************************************************************************************
    * This function shows modal dialog showing deleteform to delete list
    ***************************************************************************************/
    $('#deleteListModal').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget) // Button that triggered the modal
        let listId = button.data('list');
        let modal = $(this);
        modal.find('#list').val(listId);
    });


    /***************************************************************************************
    * This function click handler makes ajax call to add a  card to list
    * * on success adds a card to list
    ***************************************************************************************/
    $(document).on("click", ".cardToList", function () {
        let list = $(this).data("list");
        let board = $(".listRow").data("board");
        let cardTitle = $(this).parent().siblings("input").val();

        var data = {};
        data.board = board;
        data.list = list;
        data.title = cardTitle;

        // ajax call
        $.ajax({
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: 'http://localhost:3000/addCard',
            success: function (response) {
                console.log(response);
                let cardData = response.cardData;
                if ($("#list_" + data.list + " .card-body .alert.alert-danger").is(":visible"))
                    $("#list_" + data.list + " .card-body .alert.alert-danger").hide();

                let genHtml = '<div id="card_' + cardData._id + '" class="cardsInList alert alert-primary">\
                          <div class="cardInner"><span>' + cardData.title + '</span><div>\
                          <button type="button" class="showEditCard btn btn-primary mr-2">\
                              <i class="fa fa-pencil" title="Edit card" aria-hidden="true"></i>\
                          </button>\
                          <button type="button" class="deleteCard btn btn-primary">\
                              <i class="fa fa-trash" title="Delete card" aria-hidden="true"></i>\
                          </button></div></div>\
                        </div>';
                $("#list_" + data.list + " .card-body").append(genHtml);
                showHideMsg("cardSuccMsg", "Card is added successfully");

            },
            error: function (jqXHR, textStatus, err) {
                //show error message
                console.log('text status ' + textStatus + ', err ' + err)
            }
        });

    });

    /***************************************************************************************
    * This click handler makes ajax call to delete  card
    * On success that card is removed from list
    ***************************************************************************************/
    $(document).on("click", ".deleteCard", function () {
        var cardId = $(this).parents('.cardsInList').attr("id").split('card_')[1];
        var listId = $(this).parents('.card').attr("id").split('list_')[1];
        let boardId = $(".listRow").data("board");

        // data to be sent to delete particular card
        var data = {};
        data.boardId = boardId;
        data.cardId = cardId;
        data.listId = listId;

        // ajax call
        $.ajax({
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: 'http://localhost:3000/deleteCard',
            success: function (response) {
                console.log(response);
                if (response.cardData.nModified)
                    $("#card_" + cardId).remove();

                if ($("#list_" + data.listId + " .cardsInList").length == 0) {
                    $("#list_" + data.listId + " .card-body .alert.alert-danger").show();
                    if ($("#list_" + data.listId + " .card-body .alert.alert-danger").length == 0)
                        $("#list_" + data.listId + " .card-body").append('<div class="alert alert-danger"><span>No cards found.</span></div>');
                }
                showHideMsg("cardSuccMsg", "Card is deleted successfully");

            },
            error: function (jqXHR, textStatus, err) {
                console.log('text status ' + textStatus + ', err ' + err)
            }
        });

    });


    /***************************************************************************************
    * This function shows edit card form by hiding the text in card ,
    *  and displaying input field
    ***************************************************************************************/
    $(document).on("click", ".showEditCard", function () {
        let cardId = $(this).parents(".cardsInList").attr("id");
        let cardTitle = $("#" + cardId + " .cardInner span").text().trim();
        let cardHtml = '<div class="form-inline cardUpd">\
                          <div class="input-group mb-3">\
                              <input type="text" class="form-control" value="'+ cardTitle + '" required="required" name="updTitle" id="updTitle" placeholder="Card name" aria-label="card title">\
                              <div class="input-group-append">\
                                  <button type="submit" class="editCard btn btn-primary mb-2">Update</button>\
                              </div>\
                          </div>\
                      </div>';
        $("#" + cardId + " .cardInner").hide();
        $("#" + cardId).append(cardHtml);
    });

    /***************************************************************************************
    * This click handler is called onclick of submit of edit card.
    * Makes ajax call to edit the card
    * On success new card data is shown
    ***************************************************************************************/
    $(document).on("click", ".editCard", function () {
        let cardId = $(this).parents(".cardsInList").attr("id");
        var listId = $(this).parents('.card').attr("id").split('list_')[1];
        let updCardTitle = $("#" + cardId + " #updTitle").val().trim();
        let boardId = $(".listRow").data("board");

        var data = {};
        data.cardId = cardId.split('card_')[1];
        data.cardTitle = updCardTitle;
        data.list = listId;
        data.boardId = boardId;
        $.ajax({
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: 'http://localhost:3000/editCard',
            success: function (response) {
                debugger;
                console.log(response);
                let cardData = response.cardData;
                if (cardData.nModified) {
                    $("#" + cardId + " .cardInner span").text(updCardTitle);
                    $("#" + cardId + " .cardUpd").remove();
                    $("#" + cardId + " .cardInner").show();
                }
                showHideMsg("cardSuccMsg", "Card is updated successfully");

            },
            error: function (jqXHR, textStatus, err) {
                //show error message
                console.log('text status ' + textStatus + ', err ' + err)
            }
        });

    });

    // USER DATA

    /***************************************************************************************
    * This click handler is called on click of unshare button in list
    * User is unshared from board and select box is populated again.
    ***************************************************************************************/

    $(document).on("click", ".userUnshare", function () {
        debugger;
        var rowId = $(this).closest('tr').attr("id").split('row_')[1];
        var boardId = $(this).closest('table').attr('data-board');
        var userId = $(this).attr('data-userId');

        // data required to delete user
        var data = {};
        data.row = rowId;
        data.board = boardId;
        data.userId = userId;
        $.ajax({
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: 'http://localhost:3000/deleteUser',
            success: function (response) {
                debugger;
                console.log(response);
                // gets email 
                let emailId = $("#row_" + rowId + " td:eq(0)").text().trim();
                if (response.userData.nModified) {
                    // removes row from the table 
                    $("#row_" + rowId).remove();
                    // show success msg
                    showHideMsg("userMsg", "User is added successfully from board");
                    // populates select box again
                    let userRow = '<option value="' + userId + '"> ' + emailId + '</option>';
                    $("select#email").append(userRow);
                    $("button.addMember").removeAttr("disabled");
                }
            },
            error: function (jqXHR, textStatus, err) {
                //show error message
                showHideMsg("userErrMsg", err);
            }
        });

    });


    /***************************************************************************************
    * This click handler is called on click of submit button to add member
    * ajax call is made
    * On success, member is added to board and table row is inserted,
    *  and that user entry is removed from select box
    ***************************************************************************************/
    $(document).on("click", "#addMemberToList .addMember", function () {
        debugger;
        var boardId = $(this).attr('data-board');
        var emailId = $(this).siblings("select#email").val();

        var data = {};
        data.boardId = boardId;
        data.email = emailId
        $.ajax({
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: 'http://localhost:3000/addMember',
            success: function (response) {
                debugger;
                console.log(response);
                let userData = response.userData;
                let userEmail = $("#email option[value='" + userData.user + "']").text();

                $("#email option[value='" + userData.user + "']").remove();

                if ($("#email option").length == 1)
                    $("button.addMember").attr("disabled", "disabled")

                let unshare = "-";
                if (userData.unshare)
                    unshare = '<button type="button" class="btn btn-primary userUnshare" data-userId=' + userData.user + '>\
                          <i class="fa fa-times-circle" aria-hidden="true"></i>\
                      </button>';
                var genHtml = '<tr id="row_' + userData._id + '">\
                  <td>'+ userEmail + '</td>\
                  <td>'+ unshare + ' </td>\
              </tr>';

                $(".table tbody").append(genHtml);
                showHideMsg("userMsg", "User is added successfully from board");
            },
            error: function (jqXHR, textStatus, err) {
                //show error message
                console.log('text status ' + textStatus + ', err ' + err)
                showHideMsg("userErrMsg", err);
            }
        });
    });

    /***************************************************************************************
    * This function shows and hide message (success/ error)
    ***************************************************************************************/
    function showHideMsg(targetId, msg) {
        $('#' + targetId).text(msg).fadeIn(1000);
        setTimeout(function () {
            $('#' + targetId).fadeOut(1000);
        }, 3000);
    }
});


