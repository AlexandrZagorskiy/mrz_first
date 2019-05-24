//////////////////////////////////////////////////////////////////////////////////////
// Лабораторная работа 1 по дисциплине МРЗВиС
// Выполнена студентом группы 721703
// БГУИР Загорский Александр Григорьевич
// 
// В файле реализуется алгоритм вычисления целочисленного
// частного пары 4-разрядных чисел делением без восстановления
// частичного остатка.
//
// 10.05.2019: по нажатию кнопки вызывается функция pipelineInit(), по которой 
// происходит чтение элементов векторов, создается объект класса Pipeline и вызов 
// функции класса run(). Функция отстраивает таблицу с помощью функций clearTable(),
// createTable() и fillTable(). В ней же для каждой пары создаётся объекст  класса 
// BinaryComputing и вызывается функция этого класса compute(). С помощью ряда функций
// вычисляем результат деления и заполняем таблицу.
//
// https://learn.javascript.ru/
// https://developer.mozilla.org/ru/
// Division Algorithms and Hardware Implementations: Sherif Galal, Dung Pham
// Акулич Татьяна, гр 721703
//

// инициализация и создание конвейера
function pipelineInit() 
{
  let firstVector = document.getElementById('firstVector').value;
  let secondVector = document.getElementById('secondVector').value;
  let timer = document.getElementById('timer').value;
  pipeline = new Pipeline(firstVector, secondVector, timer).run();
}

class Pipeline {

  constructor(firstVector, secondVector, timer) 
  {
    this.firstVector = firstVector,
    this.secondVector = secondVector;
    this.timer = timer;
  }

// запуск конвейера
  run () 
  {
    var numsInFirstVector = this.firstVector.split(' ');
    var numsInSecondVector = this.secondVector.split(' ');
    var numsCount = numsInSecondVector.length;

    clearTable();
    createTable(numsCount);
    fillTable(numsCount, numsInFirstVector, numsInSecondVector, this.timer); 

    for (var num = 0; num < numsCount; num++) {
      new BinaryComputing(numsInFirstVector[num], numsInSecondVector[num], num).compute();
    }
  }
}

//удаление существующей таблицы
function clearTable() 
{
  var table = document.querySelector("table");

  if (table != null){
    document.body.removeChild(table);
  }
}

//создание новой таблицы
function createTable(numsCount) {
  var body = document.querySelector("body"),
    table = document.querySelector("table"),
    height = 60,
    width = 2150,
    columns = 16,
    rows = 13 + numsCount,
    firstTable = document.querySelector("table");

  table = document.createElement("table");
  table.setAttribute("width", width);
  table.setAttribute("border", "3px");
  table.setAttribute("bordercolor", "black");
  table.setAttribute("cellaLastdding", "5");
  table.setAttribute("align", "center");

  var tableRow = document.createElement("tr");
  var tableHeader = document.createElement("th");
  var text = document.createTextNode('Числа');
  tableHeader.appendChild(text);
  tableRow.appendChild(tableHeader);

  tableHeader = document.createElement("th");
  text = document.createTextNode('В двоичной системе');
  tableHeader.appendChild(text);
  tableRow.appendChild(tableHeader);
  table.appendChild(tableRow);

  for (var digitCount = 0; digitCount < 4; digitCount++) {
    tableHeader = document.createElement("th");
    text = document.createTextNode('Сдвиг ' + (digitCount + 1));
    tableHeader.appendChild(text);
    tableRow.appendChild(tableHeader);

    tableHeader = document.createElement("th");
    text = document.createTextNode('Сумма ' + (digitCount + 1));
    tableHeader.appendChild(text);
    tableRow.appendChild(tableHeader);

    tableHeader = document.createElement("th");
    text = document.createTextNode('Обновить результат ' + (digitCount + 1));
    tableHeader.appendChild(text);
    tableRow.appendChild(tableHeader);
  }

  tableHeader = document.createElement("th");
  text = document.createTextNode('Проверить остаток');
  tableHeader.appendChild(text);
  tableRow.appendChild(tableHeader);

  tableHeader = document.createElement("th");
  text = document.createTextNode('Результат');
  tableHeader.appendChild(text);
  tableRow.appendChild(tableHeader);
  table.appendChild(tableRow);

//создание ид для всех клеток таблицы
  for (var i = 0; i < rows; i++) {
    tableRow = document.createElement("tr");
    for (var j = 0; j < columns; j++) {
      var tableData = document.createElement("td");
      tableData.id = ((i + 1) + "." + (j + 1));
      tableRow.appendChild(tableData);
      tableData.setAttribute("height", height);
    }
    table.appendChild(tableRow);
  }

  if (firstTable == null) {
    return body.appendChild(table);
  } else {
    var newTable = body.appendChild(table);
    return document.body.replaceChild(newTable, firstTable);
  }
}

//заполнение таблицы
function fillTable(numsCount, numsInFirstVector, numsInSecondVector, timer) {
  var amount = numsCount - 1;
  for (var i = 0; i < amount; i++) {
    document.getElementById(1 + i + ".1").innerHTML = '<b>A: </b>' + numsInFirstVector[i] + '; </br><b>B: </b>' + numsInSecondVector[i] + '; </br> ';
  }
  document.getElementById(1 + amount + ".1").innerHTML = '<b>A: </b>' + numsInFirstVector[amount] + '; </br><b>B: </b>' + numsInSecondVector[amount] + '; </br> ';

  for (var i = 0; i < (amount + 14); i++) {
    document.getElementById(1 + i + ".1").innerHTML += '</br><b>Time: </b>' + (1 + i) * timer;
  }
}

class BinaryComputing {

  constructor(inputFirstNumber, inputSecondNumber, pairNumber) {
    this.inputFirstNumber = inputFirstNumber;                                                 //делимое в десятичной форме
    this.inputSecondNumber = inputSecondNumber;                                               //делитель в десятичной форме
    this.firstBinaryNumber = getFourDigitNumber(inputFirstNumber);                            //делимое в двоичной форме
    this.secondBinaryNumber = "0" + getFourDigitNumber(inputSecondNumber);                    //делитель в двоичной форме
    this.secondBinaryNumberAddCode = this.getNumberInAdditionalCode(this.secondBinaryNumber)  //делитель в двоичной дополнительном коде
    this.pairNumber = pairNumber;                                                             //номер пары
    this.div = "0000";                                                                        //частное
    this.summ = "00000";                                                                      //остаток
  }

//реализация алгоритма деления
  compute() {
    this.showBinaryNums();
    for (let digit = 0; digit < 4; digit++){
      this.shift();                                             //выполняем сдвиг
      document.getElementById((2 + this.pairNumber + 3*digit) + '.' + (3 + 3*digit)).innerHTML = '<b>A</b> = ' + this.firstBinaryNumber + '</br><b>Сумма</b> = ' + this.summ;
      this.getSumm();                                           //выполняем сумму
      document.getElementById((3 + this.pairNumber + 3*digit) + '.' + (4 + 3*digit)).innerHTML = '<b>Сумма</b> = ' + this.summ;
      this.fixResult();                                         //обновляем частное
      document.getElementById((4 + this.pairNumber + 3*digit) + '.' + (5 + 3*digit)).innerHTML = '<b>Результат</b> = ' + this.div;
    }
    this.restoreRemainder();                                    //получаем остаток
    document.getElementById((14 + this.pairNumber) + '.15').innerHTML = '<b>Остаток</b> = ' + this.summ;
    this.showResult();
  }

//заполняет таблицу начальными значениями
  showBinaryNums(){    
  document.getElementById((1 + this.pairNumber) + '.2').innerHTML += 
  '<b>A</b> = ' + "0" + this.firstBinaryNumber + 
  '</br><b>B</b> = ' + this.secondBinaryNumber +
  ', <b>-B</b> = ' + this.secondBinaryNumberAddCode +
  '</br><b>Сумма</b> = ' + this.summ +
  '</br><b>Результат</b> = ' + this.div;
  }

//заполняет таблицу результатом вычисления
  showResult(){
    this.summ = parseInt(this.summ, 2).toString(10);
    this.div = parseInt(this.div, 2).toString(10);
    document.getElementById((14 + this.pairNumber) + '.16').innerHTML +=
  '<b>A</b> = ' + this.inputFirstNumber + 
  '</br><b>B</b> = ' + this.inputSecondNumber +
  '</br><b>Результат</b> = ' + this.div +
  '</br><b>Остаток</b> = ' + this.summ;
  }

//получить из числа в двоичном коде число в дополнительном коде
  getNumberInAdditionalCode(binaryNumber) {
    var result = "";

    for(let times = 0; times < 5; times++){
      let temp = binaryNumber%2;

      if(temp == 1)
        result = "0" + result;
      
      else 
        result = "1" + result;
      
      binaryNumber = binaryNumber/10|0;
    }
    return binaryAddition(result, "00001");
  }

//сдвиг
  shift() {    
    this.summ = this.summ.toString().slice(1,5) + this.firstBinaryNumber[0];
    this.firstBinaryNumber = this.firstBinaryNumber.slice(1,4) + "0";
  }

//сумма
  getSumm() {
    if (this.summ[0] == 0) {
      this.summ = binaryAddition(this.summ, this.secondBinaryNumberAddCode);  
    } else {
      this.summ = binaryAddition(this.summ, this.secondBinaryNumber); 
    }
  }

//обновление частного
  fixResult() {
    if (this.summ[0] == 0) {
      this.div = this.div.slice(1,4) + "1";
    } else {
      this.div = this.div.slice(1,4) + "0";
    }
  }

//восстановление остатка
  restoreRemainder() {
    if (this.summ[0] == 1){
      this.summ = binaryAddition(this.summ, this.secondBinaryNumber);
    }
  }  
}

//получить из числа в десятичном коде 4-хразрядное число в двоичном коде
function getFourDigitNumber(number) {  
  var fourDigitNumber =  parseInt(number, 10).toString(2);  
  var temp = 0;
  if (fourDigitNumber.length < 4) {
    for (var digit = 1; digit < 4 - fourDigitNumber.length; digit++){
      temp += "0"
    }
    fourDigitNumber = temp + fourDigitNumber;
  }
  return fourDigitNumber;
}

//сумма двоичных чисел
function binaryAddition(a,b){
    var result = "",
        carry = 0;
    
    while(a || b){
      let sum = a%2 + b%2 + carry;
  
      if( sum > 1 ){  
        result = sum%2 + result; 
        carry = 1;
      }
      else{
        result = sum + result;
        carry = 0;
      }
      
      a = a/10|0; 
      b = b/10|0;
    }  
    return result;
  }