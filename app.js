//BUDGET CONTROLLER
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    sum = 0;
    data.allItems[type].forEach(function(current) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
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

    deleteItem: function(type, id) {
      var ids, index;
      // ids = data.allItems[type].map(function(current) {
      //   return current.id;
      // });

      //CHANGED THE ABOVE FUNCTION TO ARROW FUNCTION
      /**
       *  When there is only one parameter, we can remove the surrounding parenthesies:
       *  When the only statement in an arrow function is return, we can remove return and remove
       * the surrounding curly brackets
       */
      // ids = data.allItems[type].map(current => current.id);

      // DESTRUCTURING PARAMETER
      /**
       * used to get values from more complex data structures like arrays and objects
       */

      ids = data.allItems[type].map(({ id: current }) => current);
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      //1.calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      //2.calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      //3.calcuate the perentage of income spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(c) {
        c.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(c) {
        return c.getPercentage();
      });

      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
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
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    expPercLabel: ".budget__expenses--percentage",
    container: ".container",
    itemPercLabel: ".item__percentage",
    monthLabel: ".budget__title--month"
  };

  /* private function that isn't used outside this controller, that's why not returned*/
  var formatNumber = function(num, type) {
    var numSplit, int, dec, type;
    /**
     * num should have two decimal places e.g 567.8754 turns to 567.88 & 567 turns to 567.00
     * num should have commas for numbers in the thousands range e.g 4,356.89
     * there should be either a + or - sign before num depending on type
     */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3);
    }
    /**
     * subtr(startposition, length)
     * substring(startposition, endposition)
     * in both cases the 2nd argument is optional
     * when only one argument is given, it returns a portion of the string from the specified position to
     * the end of the string being extracted from
     * Additionally, the first argument to substr can be a negative integer,
     * in which case the start of the returned string is counted from the end of the string that the method is used on
     */
    dec = numSplit[1];

    return (type === "inc" ? "+" : "-") + " " + int + "." + dec;
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
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        el = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //replace placeholders in html string with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      //insert html string into the DOM
      // document.querySelector(el).insertAdjacentHTML("beforeend", newHtml);
      $(el).append(newHtml);
    },

    removeListItem: function(s) {
      $("#" + s).remove();
    },

    clearFields: function() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + "," + DOMstrings.inputValue
      );
      // convert the result of queryselectorAll above which is a list into an array
      //in ES5 this was done by using the slice method and calling it -- didn't understand how it worked

      /* fieldsArr = Array.prototype.slice.call(fields); */

      //In ES6, you just use the from method

      fieldsArr = Array.from(fields);
      fieldsArr.forEach(c => (c.value = ""));
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget >= 0 ? (type = "inc") : (type = "exp");
      $(DOMstrings.budgetLabel).text(formatNumber(obj.budget, type));
      $(DOMstrings.incomeLabel).text(formatNumber(obj.totalInc, "inc"));
      $(DOMstrings.expensesLabel).text(formatNumber(obj.totalExp, "exp"));
      if (obj.percentage > 0) {
        $(DOMstrings.expPercLabel).text(obj.percentage);
      } else {
        $(DOMstrings.expPercLabel).text("---");
      }
    },

    displayPercentages: function(percentages) {
      var fields = $(DOMstrings.itemPercLabel);
      var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          $(current).text(percentages[index] + "%");
        } else {
          $(current).text("---");
        }
      });
    },
    displayMonth: function() {
      var now, year, months, month, monthYear;
      now = new Date();
      year = now.getFullYear();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      month = now.getMonth();
      monthYear = months[month] + ", " + year;
      $(DOMstrings.monthLabel).text(monthYear);
    },
    changedType: function() {
      $(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      ).toggleClass("red-focus");

      $(DOMstrings.inputBtn).toggleClass("red");
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
    $(DOM.inputType).on("change", UICtrl.changedType);

    document.addEventListener("keypress", function(e) {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    $(DOM.container).on("click", ctrlDeleteItem);
  };

  var updateBudget = function() {
    //1. Calculate the budget
    budgetCtrl.calculateBudget();
    //2. Return the budget
    var budget = budgetCtrl.getBudget();
    //3. Display the budget to the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    //1. Calculate Percentages
    budgetCtrl.calculatePercentages();
    //2. Read Percentages from budget controller
    var percentages = budgetCtrl.getPercentages();
    //3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
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

      //6. Calculate and update percentages
      updatePercentages();
    }
  };
  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;
    //when the split method (or any method) is called on a primitive, javascript converts it to an object so the method can be used on it
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    splitID = itemID.split("-");
    if (splitID) {
      type = splitID[0];
      ID = Number(splitID[1]);

      //1. delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      //2. delete the item from UI
      UICtrl.removeListItem(itemID);
      //3. update and show the new budget
      updateBudget();
      //4. Calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log("Application has started");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });

      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
