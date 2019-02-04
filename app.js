//BUDGET CONTROLLER
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    }
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      //create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new item
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //add new item to the data strucuture
      data.allItems[type].push(newItem);

      //return new item
      return newItem;
    },
    testing: function() {
      console.log(data);
    }
  };
})();

//UI CONTROLLER
var UIController = (function() {
  DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list"
  };

  return {
    getInput: function() {
      return {
        type: $(DOMstrings.inputType).val(), //will be either inc or exp
        description: $(DOMstrings.inputDescription).val(),
        value: parseFloat($(DOMstrings.inputValue).val())
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, el;

      //create html string with placeholder text
      if (type === "inc") {
        el = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        el = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //replace placeholders in html string with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);

      //insert html string into the DOM
      // document.querySelector(el).insertAdjacentHTML("beforeend", newHtml);
      $(el).append(newHtml);
    },

    clearFields: function() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + "," + DOMstrings.inputValue
      );
      // convert the result of queryselectorAll above which is a list into an array
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    DOM = UICtrl.getDOMstrings();
    $(DOM.inputBtn).on("click", ctrlAddItem);

    document.addEventListener("keypress", function(e) {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });
  };

  var updateBudget = function() {
    //1. Calculate the budget
    //2. Return the budget
    //3. Display the budget to the UI
  };
  var ctrlAddItem = function() {
    var input, newItem;
    //1. Get the field input data
    input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      //3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      //4. Clear the fields
      UICtrl.clearFields();

      //5. calculate and update budget
      updateBudget();
    }
  };

  return {
    init: function() {
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
