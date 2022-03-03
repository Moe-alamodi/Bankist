"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2022-02-25T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2022-03-01T00:01:17.194Z",
    "2022-03-02T23:36:17.929Z",
    "2022-03-01T10:51:36.790Z",
  ],
  currency: "USD",
  locale: "en-us", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "CAD",
  locale: "en-CA",
};
const account3 = {
  owner: "Mohammed Al-Amodi",
  movements: [5000, 3400, 150, -500, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 3333,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2022-02-25T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2022-03-01T00:01:17.194Z",
    "2022-03-02T23:36:17.929Z",
    "2022-03-01T10:51:36.790Z",
  ],
  currency: "YER",
  locale: "ar-YE",
};
const accounts = [account1, account2, account3];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
// Functions
const formatMovementsDate = function (date, local) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
  const today = new Date();
  const numberOfdaysPassed = calcDaysPassed(today, date);
  const day = `${date.getDate()}`.padStart(2, 0);
  const month = `${date.getMonth() + 1}`.padStart(2, 0);
  const year = date.getFullYear();

  return numberOfdaysPassed < 1
    ? "Today"
    : numberOfdaysPassed === 1
    ? "Yesterday"
    : numberOfdaysPassed <= 7
    ? `${numberOfdaysPassed} days ago`
    : `${new Intl.DateTimeFormat(local).format(date)}`;
};
const formatCurrency = function (amount, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount.toFixed(2));
};
const startLogOutTimer = function () {
  // Set timer to 5 min
  // call the timer every second
  const tick = () => {
    const mins = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call, print the remaining time to UI
    labelTimer.textContent = `${mins}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }
    // Decrease -1
    time--;
    if (time < 10) {
      labelTimer.style.color = "red";
    }
  };
  let time = 300;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = "";
  const movements = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movements.forEach((el, i) => {
    const date = new Date(account.movementsDates[i]);
    const local = account.locale;
    const displayDate = formatMovementsDate(date, local);
    const type = el > 0 ? "deposit" : "withdrawal";
    el = formatCurrency(el, local, account.currency);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>

      <div class="movements__value">${el}</div>
  </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", html);
    // labelDate.innerHTML = `${utc}`;
  });
  calcBalance(account);
};

const calcDisplaySummary = function (account) {
  const moneyIn = account.movements
    .filter((mov) => mov > 0)
    .reduce((sum, mov) => sum + mov, 0);
  const moneyOut = account.movements
    .filter((mov) => mov < 0)
    .reduce((sum, mov) => sum + mov, 0);
  const interest = account.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * account.interestRate) / 100)
    .filter((el) => el >= 1)
    .reduce((sum, mov) => sum + mov, 0);
  labelSumIn.innerHTML = `${formatCurrency(
    moneyIn,
    account.locale,
    account.currency
  )}`;
  labelSumOut.innerHTML = `${formatCurrency(
    Math.abs(moneyOut),
    account.locale,
    account.currency
  )}`;
  labelSumInterest.innerHTML = `${formatCurrency(
    interest,
    account.locale,
    account.currency
  )}`;
};
// Calculate the current blance for each accounts
const calcBalance = (acc) => {
  acc.balance = acc.movements.reduce((sum, el) => sum + el, 0);
  displayBlance(acc);
  calcDisplaySummary(acc);
};

const displayBlance = function (account) {
  const currentBalance = new Intl.NumberFormat(account.locale, {
    style: "currency",
    currency: account.currency,
  }).format(account.balance);
  labelBalance.innerHTML = `${currentBalance}`;

  const now = new Date();
  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  };
  const local = account.locale;
  const currentDate = new Intl.DateTimeFormat(local, options).format(now);
  labelDate.innerHTML = `${currentDate}`;
};

// const user = 'Jessica Davis';
const createUsername = function (accounts) {
  accounts.forEach((acc) => {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name.at(0))
      .join("");
  });
};
createUsername(accounts);
// Enevt handlers
let tragetAccount, timer;
const loginHandler = function (e) {
  e.preventDefault();
  // Get current account
  tragetAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  //   if (tragetAccount?.pin === Number(inputLoginPin.value)) {
  if (tragetAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    containerApp.style.opacity = 1;
    labelWelcome.innerHTML = `Hello, ${tragetAccount.owner.split(" ").at(0)}`;
    // Clear inputs fields

    inputLoginPin.blur();
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Display movements UI
    displayMovements(tragetAccount);
  }
  inputLoginUsername.value = "";
  inputLoginPin.value = "";
};
const transferHandler = function (e) {
  e.preventDefault();
  const receiver = inputTransferTo.value;
  //  const amount = Number(inputTransferAmount.value);
  const amount = +inputTransferAmount.value;
  // Clear input feilds
  inputTransferTo.value = inputTransferAmount.value = "";
  // Get the receiver account
  const receiverAcc = accounts.find((acc) => acc.username === receiver);
  // Transfer conditions
  setTimeout(() => {
    if (
      amount > 0 &&
      receiverAcc &&
      tragetAccount.balance > amount &&
      receiverAcc.username !== tragetAccount.username
    ) {
      tragetAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);
      tragetAccount.movementsDates.push(new Date().toISOString());
      receiverAcc.movementsDates.push(new Date().toISOString());

      // Update UI
      displayMovements(tragetAccount);
    }
  }, 3000);
  clearInterval(timer);
  timer = startLogOutTimer();
};
const loanHandler = (e) => {
  e.preventDefault();
  const loanAmount = Math.floor(inputLoanAmount.value);
  inputLoanAmount.value = "";
  setTimeout(() => {
    if (
      loanAmount > 0 &&
      tragetAccount.movements.some((mov) => mov >= loanAmount * 0.1)
    ) {
      tragetAccount.movements.push(loanAmount);
      tragetAccount.movementsDates.push(new Date().toISOString());
      displayMovements(tragetAccount);
    }
  }, 3000);
  clearInterval(timer);
  timer = startLogOutTimer();
};
const closeAccHandler = function (e) {
  e.preventDefault();
  console.log(accounts);

  // Get userName and PIN of the account
  const accountUser = inputCloseUsername.value;
  //  const accountPin = Number(inputClosePin.value);
  const accountPin = +inputClosePin.value;
  // Clear Inputs Feilds
  inputCloseUsername.value = inputClosePin.value = "";
  // Check inputs
  if (
    accountUser === tragetAccount.username &&
    accountPin === tragetAccount.pin
  ) {
    console.log(tragetAccount);
    // Find the index of the account in accounts array.
    const index = accounts.findIndex(
      (acc) => acc.username === tragetAccount.username
    );
    // console.log(index);

    accounts.splice(index, 1);

    containerApp.style.opacity = 0;

    // console.log(accounts);
  }
};
let sorted = false;
const sortHandler = (e) => {
  e.preventDefault();
  displayMovements(tragetAccount, !sorted);
  sorted = !sorted;
};

btnLogin.addEventListener("click", loginHandler);
btnTransfer.addEventListener("click", transferHandler);
btnClose.addEventListener("click", closeAccHandler);
btnLoan.addEventListener("click", loanHandler);
btnSort.addEventListener("click", sortHandler);
document.body.addEventListener("click", () => {
  clearInterval(timer);
  timer = startLogOutTimer();
});
