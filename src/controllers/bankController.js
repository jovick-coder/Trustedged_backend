const User = require("../models//userModel");
const Transaction = require("../models/transactionModel");
const sendEmail = require("../utils/emailService");
const { createNotification } = require("./notificationController");
const bcrypt = require("bcryptjs");
const Details = require("../models/detailsModel");
const Notification = require("../models/notificationModal");

// Create a new detail
const getDetails = async (req, res) => {
  const { userId, isAdmin } = res.locals;
  const { code } = req.query;
  // console.log(req.query)

  try {

    let query = {};


    if (code) {
      query.code = code;
      query.deleted = false;
    }

    if (isAdmin) {
      // console.log({ query })
      if (query.code) {
        const detail = await Details.findOne(query);
        if (!detail) return res.status(404).json({ error: "Invalid Detail" });
        res.status(200).json({ detail });
      } else {
        let details = await Details.find(query);
        // remove deleted details
        details = details.filter((detail) => !detail.deleted);
        res.status(200).json({ details });
      }
    } else {
      // console.log({ code })
      if (!code) return res.status(400).json({ error: "Code is required" });
      const detail = await Details.findOne(query);
      if (!detail) return res.status(404).json({ error: "Invalid Detail" });
      res.status(200).json({ detail });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error getting details", error: error.message });
  }
};

// Create a new detail
const createDetails = async (req, res) => {
  const { code, name, channel, active } = req.body;

  try {
    const newDetail = new Details({ code, name, channel, active });
    await newDetail.save();
    res
      .status(201)
      .json({ message: "Detail created successfully", detail: newDetail });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an existing detail
const updateDetails = async (req, res) => {
  const { id } = req.query;
  const { code, name, channel, active } = req.body;

  try {
    const detail = await Details.findById(id);
    if (!detail) return res.status(404).json({ error: "Detail not found" });

    detail.code = code !== undefined ? code : detail.code;
    detail.name = name !== undefined ? name : detail.name;
    detail.channel = channel !== undefined ? channel : detail.channel;
    detail.active = active !== undefined ? active : detail.active;

    await detail.save();
    res.status(200).json({ message: "Detail updated successfully", detail });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

//  delete an existing detail by making deleted true
const deleteDetails = async (req, res) => {
  const { id } = req.query;
  try {
    const detail = await Details.findOne({ _id: id });
    if (!detail) {
      return res.status(404).json({ error: "Detail not found" });
    }

    detail.deleted = true;
    await detail.save();
    res.status(200).json({ message: "User detail deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Admin modifies user balance
const makeTransaction = async (req, res) => {
  const { id } = req.query;
  const { userId, isAdmin } = res.locals;
  const { method, amount, password, description, account } = req.body;

  try {
    let user;
    let profileID;
    if (!amount || amount === "")
      return res.status(400).json({ error: "Amount is required" });
    if (!method || method === "")
      return res.status(400).json({ error: "Method is required" });

    if (isAdmin) {
      profileID = id;
      user = await User.findOne({ _id: id });
      if (!user) return res.status(404).json({ error: "User not found" });
    } else {
      profileID = userId;
      user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      if (!password || password === "")
        return res.status(400).json({ error: "Password is required" });

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user?.password);
      if (!isMatch) return res.status(400).json({ message: "Wrong password" });
    }

    if (!user) return res.status(404).json({ error: "User account not found" });

    if (method === "+") {
      user.account.balance += Number(amount);
    } else if (method === "-") {
      if (user.account.balance < amount)
        return res.status(400).json({ error: "Insufficient balance" });
      user.account.balance -= Number(amount);
    } else {
      return res.status(400).json({ error: "Invalid method" });
    }

    await user.save();
    const notification = await createNotification({
      userId: user._id,
      message: `Your account balance was ${method === "+" ? "credited with" : "debited by"
        } $${amount}.`,
      mailSent: true,
    });

    const transaction = await Transaction.create({
      userId: profileID,
      amount,
      type: method === "+" ? "credit" : "debit",
      description,
      account,
      notification: notification._id,
    });
    await sendEmail(
      user.email,
      "Balance Update",
      `<p>Your account balance was ${method === "+" ? "credited with" : "debited by"
      } $${amount}.</p>`
    );

    res.status(200).json({
      transaction,
      message: `Balance ${method === "+" ? "credited" : "debited"
        } successfully by ${amount} newBalance is ${user.account.balance}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Admin modifies user balance
const makeCardTransaction = async (req, res) => {
  const { id } = req.query;
  const { userId, isAdmin } = res.locals;
  const { amount, password, method, account } = req.body;

  try {
    let user;
    let profileID;
    if (!amount || amount === "")
      return res.status(400).json({ error: "Amount is required" });


    profileID = userId;
    user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!password || password === "")
      return res.status(400).json({ error: "Password is required" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user?.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });


    if (!user) return res.status(404).json({ error: "User account not found" });


    if (user.account.balance < amount)
      return res.status(400).json({ error: "Insufficient balance" });
    user.account.balance -= Number(amount);


    await user.save();
    const notification = await createNotification({
      userId: user._id,
      message: `Your account balance was debited by $${amount}, transfer to card.`,
      mailSent: true,
    });

    const transaction = await Transaction.create({
      userId: profileID,
      amount,
      type: "card",
      description: `Transfer to card from ${method === "wallet" ? "External wallet" : "bank"}`,
      account,
      notification: notification._id,
    });
    await sendEmail(
      user.email,
      "Balance Update",
      `<p>Your account balance was debited by $${amount}, transfer to card  from ${method === "wallet" ? "External wallet" : "bank"}.</p>`
    );

    res.status(200).json({
      transaction,
      message: `Balance debited successfully by ${amount} newBalance is ${user.account.balance}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an existing transaction
const updateTransaction = async (req, res) => {
  const { id } = req.query;
  const { amount, method, description, status, date } = req.body;

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction)
      return res.status(404).json({ error: "Transaction not found" });

    transaction.amount = amount !== undefined ? amount : transaction.amount;
    transaction.type =
      method !== undefined
        ? method === "+"
          ? "credit"
          : "debit"
        : transaction.type;
    transaction.description =
      description !== undefined ? description : transaction.description;
    transaction.status = status !== undefined ? status : transaction.status;
    transaction.date =
      date !== undefined ? date : transaction.date;

    // update notification date with the new date
    if (date && transaction?.notification) {
      // update notification id
      await Notification.findOneAndUpdate({ _id: transaction?.notification }, { date: transaction.date }, { new: true });

    }

    await transaction.save();
    res
      .status(200)
      .json({ message: "Transaction updated successfully", transaction });
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ error: error.message, message: "Transaction was not updated" });
  }
};

// Update an existing transaction
const deleteTransaction = async (req, res) => {
  const { id } = req.query;

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction)
      return res.status(404).json({ error: "Transaction not found" });

    transaction.deleted = true;

    await transaction.save();
    res
      .status(200)
      .json({ message: "Transaction deleted successfully", transaction });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message, message: "Transaction was not deleted" });
  }
};

// Admin modifies user balance
const modifyBalance = async (req, res) => {
  const { userId } = req.params;
  const { method, amount } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (method === "+") {
      user.account.balance += Number(amount);
    } else if (method === "-") {
      user.account.balance -= Number(amount);
    } else {
      return res.status(400).json({ error: "Invalid method" });
    }

    await user.save();

    await Transaction.create({
      userId,
      amount,
      type: method === "+" ? "credit" : "debit",
    });
    await sendEmail(
      user.email,
      "Balance Update",
      `<p>Your account balance was ${method === "+" ? "credited with" : "debited by"
      } $${amount}.</p>`
    );
    createNotification({
      userId,
      message: `Your account balance was ${method === "+" ? "credited with" : "debited by"
        } $${amount}.`,
      mailSent: true,
    });

    res.status(200).json({ message: "Balance updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// User views transaction history
const getUserHistory = async (req, res) => {
  const { userId, isAdmin } = res.locals;
  const { id, userID } = req.query;
  try {
    let query = { deleted: false };

    if (isAdmin) {
      if (id) {
        query._id = id;
      } else if (userID) {
        query.userId = userID;
      }
    } else {
      if (id) {
        query._id = id;
      } else {
        query.userId = userId;
      }
    }

    const transactions = await Transaction.find(query)
      .populate("userId", "fullName")
      .sort({ createdAt: -1 });
    return res.status(200).json({ ok: true, transactions });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  modifyBalance,
  getUserHistory,
  makeTransaction,
  createDetails,
  updateDetails,
  getDetails,
  updateTransaction, deleteTransaction, deleteDetails, makeCardTransaction
};
