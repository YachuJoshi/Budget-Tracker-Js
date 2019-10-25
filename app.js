let budgetController = (function() {
    let Incomes = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let Expenses = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expenses.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expenses.prototype.getPercentage = function() {
        return this.percentage;
    }

    let data = {
        allItems: {
            inc: [],
            exp: []
        } ,
        totals: {
            inc: 0,
            exp: 0
        } ,
        budget: 0 ,
        percentage: -1
    };

    let calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(element => {
            sum += element.value;
        });
        data.totals[type] = sum;
    }

    return {
        addItems: function(type, des, val) {
            let ID, newItem;
            //Create new ID.
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else { 
                ID = 0;
            }
            //Create new item based on 'inc' or 'exp'.
            if(type === 'inc') {
                newItem = new Incomes(ID,des,val);
            } else if(type === 'exp') {
                newItem = new Expenses(ID,des,val);
            }
            //Push the item into the data structure.
            data.allItems[type].push(newItem);
            //Return the item.
            return newItem;
        } ,

        deleteItems: function(type, id) {
            let idArray , index;
            idArray = data.allItems[type].map(element => {
                return element.id;
            });
            index = idArray.indexOf(id);
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        } ,

        calculateBudget: function() {
            //1. Calculate total income and expenses.
            calculateTotal('inc');
            calculateTotal('exp');

            //2. Calculate the budge.
            data.budget = data.totals.inc - data.totals.exp;

            //3. Calculate the percentage of income that was spent.
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        } , 

        calculatePercentages: function() {
            data.allItems.exp.forEach(element => {
                element.calcPercentage(data.totals.inc);
            });
        } ,

        getPercentages: function() {
            let allPerc = data.allItems.exp.map(element => {
                return element.getPercentage();
            });
            return allPerc;
        } ,

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        } ,
        
        testing: function() {
            console.log(data);
        }
    }

})();

let UIController = (function(){

    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesItemPercentage: '.item__percentage',
        dateLabel: '.budget__title--date'
    };

    let formatNumber = function(num, type) {
        let numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, int.length);
        }
        dec = numSplit[1]; 
        return (type ==='inc'? '+' : '-') + ' ' + int + '.' + dec; 
    };

    let nodeListForEach = function(list, callback) {
        for(let i=0; i<list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        } ,

        addListItem: function(obj, type) {
            let html, newHtml, element;
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        } ,

        deleteListItem: function(selectorID) {
            let element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        } ,

        clearFields: function(){
            let field, fieldArr;
            field = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldArr = Array.prototype.slice.call(field);
            fieldArr.forEach(element => {
                element.value = "";
            });
            fieldArr[0].focus();
        } ,

        displayBudget: function(obj) {
            let type;
            obj.budget >= 0? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }
        } , 
        
        displayPercentages: function(percentages) {
            let fields = document.querySelectorAll(DOMstrings.expensesItemPercentage);
            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });
        } , 

        displayDate: function() {
            let now, month, year, monthArray;
            now = new Date();
            month = now.getMonth();
            monthArray = ['January', 'February','March', 'April', 'May', 'June', 'July', 'August', 
            'September', 'October', 'November', 'December'];
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = monthArray[month] + ', ' + year;
        } ,

        changedType: function() {
            let fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription 
            + ',' + DOMstrings.inputValue);
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        } ,

        getDOMStrings: function() {
            return DOMstrings;
        } 
    }
})();

let appController = (function(budgetCtrl, UICtrl) {

    let setupEventListeners = function() {
        let DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItems);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItems();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItems);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    let updateBudget = function() {

        //1. Calculate the budget.
        budgetCtrl.calculateBudget();

        //2. Return the budget.
        let budget = budgetCtrl.getBudget();

        //3. Display the budget.
        UICtrl.displayBudget(budget);
    };

    let updatePercentage = function() {

        //1. Calculate the percentage.
        budgetCtrl.calculatePercentages();

        //2. Read the percentage & update.
        let percentages = budgetCtrl.getPercentages();

        //3. Update the percentage in the UI.
        UICtrl.displayPercentages(percentages);
    }

    let ctrlAddItems = function() {

        let input, newItem;

        //1. Get field input.
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2. Add the items to the budget controller.
            newItem = budgetCtrl.addItems(input.type, input.description, input.value);

            //3. Add the items to the UI.
            UICtrl.addListItem(newItem, input.type);
        
            //4. Clear the fields.
            UICtrl.clearFields();

            //5. Update the budget.
            updateBudget();

            //5. Calculate and update the percentage.
            updatePercentage();
            }
        };

    let ctrlDeleteItems = function(event) {
        let itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }

        //1. Delete item from data structure.
        budgetCtrl.deleteItems(type, ID);

        //2. Delete item from UI.
        UICtrl.deleteListItem(itemID);

        //3. Update the budget data and UI.
        updateBudget();

        //4. Calculate and update the percentage.
        updatePercentage();
    };

    return {
        init: function() {
            console.log('Application has started!');
            UICtrl.displayDate();
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

appController.init();