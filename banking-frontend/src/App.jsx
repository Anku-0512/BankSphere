
import { useEffect, useState } from 'react'
import {
  getCustomers,
  getAccounts,
  depositMoney,
  withdrawMoney,
  getTransactionHistory,
  createAccount,
  registerCustomer,
  getBeneficiaries,
  addBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  transferMoney,
} from './api'
import './App.css'
import Login from './Login'

const API_URL = 'http://localhost:8080'

function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activePage, setActivePage] = useState('Dashboard')

  const [customers, setCustomers] = useState([])
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [transactions, setTransactions] = useState([])
  const [miniStatement, setMiniStatement] = useState([])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [miniLoading, setMiniLoading] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [customerMessage, setCustomerMessage] = useState('')

  const [customerId, setCustomerId] = useState('')
  const [accountType, setAccountType] = useState('Savings')
  const [initialBalance, setInitialBalance] = useState('500')
  const [accountMessage, setAccountMessage] = useState('')

  const [beneficiaryCustomerId, setBeneficiaryCustomerId] = useState('1')
  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [beneficiaryAccountNumber, setBeneficiaryAccountNumber] = useState('')
  const [beneficiaryBankName, setBeneficiaryBankName] = useState('')
  const [beneficiaryIfscCode, setBeneficiaryIfscCode] = useState('')
  const [beneficiaries, setBeneficiaries] = useState([])
  const [beneficiaryMessage, setBeneficiaryMessage] = useState('')
  const [beneficiaryLoading, setBeneficiaryLoading] = useState(false)
  const [editingBeneficiaryId, setEditingBeneficiaryId] = useState(null)

  const [sourceAccount, setSourceAccount] = useState('')
  const [destinationAccount, setDestinationAccount] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferMessage, setTransferMessage] = useState('')

  const getAccountNumber = (account) =>
    String(account?.accountNumber ?? account?.account_number ?? '')

  const getBalance = (account) => Number(account?.balance ?? 0)

  const getCustomerId = (customer) =>
    customer?.customerId ?? customer?.customer_id ?? ''

  const getCustomerName = (customer) =>
    customer?.name ??
    customer?.fullName ??
    customer?.full_name ??
    'Customer'

  const clearBeneficiaryForm = () => {
    setBeneficiaryName('')
    setBeneficiaryAccountNumber('')
    setBeneficiaryBankName('')
    setBeneficiaryIfscCode('')
    setEditingBeneficiaryId(null)
  }

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      setLoading(true)

      const [customerData, accountData] = await Promise.all([
        getCustomers(),
        getAccounts(),
      ])

      const customerList = Array.isArray(customerData)
        ? customerData
        : []

      const accountList = Array.isArray(accountData)
        ? accountData
        : []

      setCustomers(customerList)
      setAccounts(accountList)

      const accountExists = accountList.some(
        (account) => getAccountNumber(account) === selectedAccount
      )

      const nextAccount = accountExists
        ? selectedAccount
        : getAccountNumber(accountList[0] ?? {})

      setSelectedAccount(nextAccount)

      if (nextAccount) {
        try {
          const history = await getTransactionHistory(nextAccount)
          setTransactions(Array.isArray(history) ? history : [])
        } catch (error) {
          console.error('Transaction history error:', error)
          setTransactions([])
        }
      } else {
        setTransactions([])
      }
    } catch (error) {
      console.error('Dashboard error:', error)
      setMessage(
        `Dashboard error: ${error.message || 'Unable to load dashboard.'}`
      )
    } finally {
      setLoading(false)
    }
  }

  // Load mini statement
  const loadMiniStatement = async (accountNumber) => {
    if (!accountNumber) {
      setMiniStatement([])
      return
    }

    try {
      setMiniLoading(true)

      const response = await fetch(
        `${API_URL}/api/accounts/${encodeURIComponent(accountNumber)}/mini-statement`
      )

      if (!response.ok) {
        throw new Error('Failed to load Mini Statement.')
      }

      const data = await response.json()
      setMiniStatement(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Mini Statement error:', error)
      setMiniStatement([])
      setMessage(error.message || 'Failed to load Mini Statement.')
    } finally {
      setMiniLoading(false)
    }
  }

  // Load beneficiaries
  const loadBeneficiaries = async (id) => {
    if (!id) {
      setBeneficiaries([])
      return
    }

    try {
      setBeneficiaryLoading(true)

      const data = await getBeneficiaries(id)
      setBeneficiaries(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Beneficiary loading error:', error)
      setBeneficiaries([])
      setBeneficiaryMessage(
        error.message || 'Failed to load beneficiaries.'
      )
    } finally {
      setBeneficiaryLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLoginSuccess = async () => {
    setIsLoggedIn(true)
    setShowLogin(false)
    setActivePage('Dashboard')
    setMessage('Login successful!')
    await loadDashboard()
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setShowLogin(true)
    setActivePage('Dashboard')
    setMessage('')
  }

  const openLogin = () => {
    setMessage('')
    setShowLogin(true)
  }

  const openPage = (page) => {
    setActivePage(page)
    setMessage('')

    if (page === 'Mini Statement') {
      loadMiniStatement(selectedAccount)
    }

    if (page === 'Beneficiaries') {
      const id =
        beneficiaryCustomerId ||
        String(getCustomerId(customers[0] ?? {}))

      setBeneficiaryCustomerId(id)
      loadBeneficiaries(id)
    }
  }

  // Register customer
  const handleRegisterCustomer = async (e) => {
    e.preventDefault()
    setCustomerMessage('')

    try {
      const result = await registerCustomer(
        name.trim(),
        email.trim(),
        phone.trim(),
        address.trim()
      )

      setCustomerMessage(
        typeof result === 'string'
          ? result
          : 'Customer registered successfully!'
      )

      setName('')
      setEmail('')
      setPhone('')
      setAddress('')

      const data = await getCustomers()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Customer registration error:', error)
      setCustomerMessage(
        error.message || 'Customer registration failed.'
      )
    }
  }

  // Create bank account
  const handleCreateAccount = async (e) => {
    e.preventDefault()
    setAccountMessage('')

    if (!customerId) {
      setAccountMessage('Please select a customer.')
      return
    }

    const balance = Number(initialBalance)

    if (!Number.isFinite(balance) || balance < 0) {
      setAccountMessage('Enter a valid initial balance.')
      return
    }

    try {
      const result = await createAccount(
        Number(customerId),
        accountType,
        balance
      )

      setAccountMessage(
        typeof result === 'string'
          ? result
          : 'Bank account created successfully!'
      )

      await loadDashboard()
    } catch (error) {
      console.error('Create account error:', error)
      setAccountMessage(error.message || 'Account creation failed.')
    }
  }

  // Change selected account
  const handleAccountChange = async (e) => {
    const accountNumber = e.target.value

    setSelectedAccount(accountNumber)
    setTransactions([])
    setMiniStatement([])
    setMessage('')

    if (!accountNumber) return

    try {
      const history = await getTransactionHistory(accountNumber)
      setTransactions(Array.isArray(history) ? history : [])
      await loadMiniStatement(accountNumber)
    } catch (error) {
      console.error('Transaction history error:', error)
      setMessage(error.message || 'Failed to load transaction history.')
    }
  }

  // Deposit or withdraw money
  const handleMoneyOperation = async (operation) => {
    setMessage('')

    if (!selectedAccount) {
      setMessage('Please select an account.')
      return
    }

    const value = Number(amount)

    if (!Number.isFinite(value) || value <= 0) {
      setMessage('Enter a valid amount greater than zero.')
      return
    }

    try {
      setLoading(true)

      const result =
        operation === 'deposit'
          ? await depositMoney(selectedAccount, value)
          : await withdrawMoney(selectedAccount, value)

      setMessage(
        typeof result === 'string'
          ? result
          : operation === 'deposit'
            ? 'Deposit successful!'
            : 'Withdrawal successful!'
      )

      setAmount('')

      const accountData = await getAccounts()
      setAccounts(Array.isArray(accountData) ? accountData : [])

      const history = await getTransactionHistory(selectedAccount)
      setTransactions(Array.isArray(history) ? history : [])

      await loadMiniStatement(selectedAccount)
    } catch (error) {
      console.error('Money operation error:', error)
      setMessage(error.message || `${operation} failed.`)
    } finally {
      setLoading(false)
    }
  }

  // Transfer money between accounts
  const handleTransfer = async (e) => {
    e.preventDefault()

    if (loading) return

    setTransferMessage('')

    if (!sourceAccount || !destinationAccount || !transferAmount) {
      setTransferMessage('Please fill in all transfer fields.')
      return
    }

    if (sourceAccount === destinationAccount) {
      setTransferMessage('Select two different accounts.')
      return
    }

    const amountText = transferAmount.trim()
    const value = Number(amountText)

    if (!Number.isFinite(value) || value <= 0) {
      setTransferMessage('Enter a valid amount greater than zero.')
      return
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amountText)) {
      setTransferMessage(
        'Amount cannot have more than two decimal places.'
      )
      return
    }

    const source = accounts.find(
      (account) =>
        getAccountNumber(account) === String(sourceAccount)
    )

    if (!source) {
      setTransferMessage('Source account not found.')
      return
    }

    if (getBalance(source) < value) {
      setTransferMessage('Insufficient balance.')
      return
    }

    try {
      setLoading(true)

      const result = await transferMoney(
        sourceAccount,
        destinationAccount,
        value
      )

      setTransferMessage(
        result || 'Money transferred successfully.'
      )

      setTransferAmount('')

      await loadDashboard()

      const history = await getTransactionHistory(sourceAccount)
      setTransactions(Array.isArray(history) ? history : [])

      await loadMiniStatement(sourceAccount)
    } catch (error) {
      console.error('Money transfer error:', error)

      setTransferMessage(
        error.message || 'Money transfer failed.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Change beneficiary customer
  const handleBeneficiaryCustomerChange = async (e) => {
    const id = e.target.value
    setBeneficiaryCustomerId(id)
    clearBeneficiaryForm()
    setBeneficiaryMessage('')
    await loadBeneficiaries(id)
  }

  // Add or update beneficiary
  const handleSaveBeneficiary = async (e) => {
    e.preventDefault()
    setBeneficiaryMessage('')

    if (!beneficiaryCustomerId) {
      setBeneficiaryMessage('Please select a customer.')
      return
    }

    if (
      !beneficiaryName.trim() ||
      !beneficiaryAccountNumber.trim() ||
      !beneficiaryBankName.trim() ||
      !beneficiaryIfscCode.trim()
    ) {
      setBeneficiaryMessage('Please fill in all beneficiary fields.')
      return
    }

    try {
      setBeneficiaryLoading(true)

      let result

      if (editingBeneficiaryId !== null) {
        result = await updateBeneficiary(
          beneficiaryCustomerId,
          editingBeneficiaryId,
          beneficiaryName.trim(),
          beneficiaryAccountNumber.trim(),
          beneficiaryBankName.trim(),
          beneficiaryIfscCode.trim().toUpperCase()
        )
      } else {
        result = await addBeneficiary(
          beneficiaryCustomerId,
          beneficiaryName.trim(),
          beneficiaryAccountNumber.trim(),
          beneficiaryBankName.trim(),
          beneficiaryIfscCode.trim().toUpperCase()
        )
      }

      setBeneficiaryMessage(
        result ||
          (editingBeneficiaryId !== null
            ? 'Beneficiary updated successfully!'
            : 'Beneficiary added successfully!')
      )

      clearBeneficiaryForm()
      await loadBeneficiaries(beneficiaryCustomerId)
    } catch (error) {
      console.error('Save beneficiary error:', error)
      setBeneficiaryMessage(
        error.message ||
          (editingBeneficiaryId !== null
            ? 'Failed to update beneficiary.'
            : 'Failed to add beneficiary.')
      )
    } finally {
      setBeneficiaryLoading(false)
    }
  }

  // Start editing beneficiary
  const handleEditBeneficiary = (item) => {
    const beneficiaryId = item.beneficiary_id ?? item.beneficiaryId

    if (beneficiaryId == null) {
      setBeneficiaryMessage('Invalid beneficiary ID.')
      return
    }

    setEditingBeneficiaryId(beneficiaryId)
    setBeneficiaryName(
      item.beneficiary_name ?? item.beneficiaryName ?? ''
    )
    setBeneficiaryAccountNumber(
      item.account_number ?? item.accountNumber ?? ''
    )
    setBeneficiaryBankName(item.bank_name ?? item.bankName ?? '')
    setBeneficiaryIfscCode(
      item.ifsc_code ?? item.ifscCode ?? ''
    )
    setBeneficiaryMessage('Edit beneficiary details and click Update.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Delete beneficiary
  const handleDeleteBeneficiary = async (beneficiaryId) => {
    if (beneficiaryId == null || !beneficiaryCustomerId) {
      setBeneficiaryMessage('Invalid beneficiary or customer ID.')
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this beneficiary?'
    )

    if (!confirmed) return

    try {
      setBeneficiaryLoading(true)
      setBeneficiaryMessage('')

      const result = await deleteBeneficiary(
        beneficiaryCustomerId,
        beneficiaryId
      )

      setBeneficiaryMessage(
        result || 'Beneficiary deleted successfully!'
      )

      if (editingBeneficiaryId === beneficiaryId) {
        clearBeneficiaryForm()
      }

      await loadBeneficiaries(beneficiaryCustomerId)
    } catch (error) {
      console.error('Delete beneficiary error:', error)
      setBeneficiaryMessage(
        error.message || 'Failed to delete beneficiary.'
      )
    } finally {
      setBeneficiaryLoading(false)
    }
  }

  const totalBalance = accounts.reduce(
    (total, account) => total + getBalance(account),
    0
  )

  const navigation = [
    { name: 'Dashboard', icon: '▦' },
    { name: 'Customers', icon: '♙' },
    { name: 'Create Account', icon: '＋' },
    { name: 'Bank Accounts', icon: '▤' },
    { name: 'Transactions', icon: '↔' },
    { name: 'Money Transfer', icon: '⇄' },
    { name: 'Mini Statement', icon: '▤' },
    { name: 'Beneficiaries', icon: '♧' },
  ]

  if (showLogin) {
    return (
      <div className="app-container">
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    )
  }

  return (
    <div className="bank-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">₹</div>
          <div>
            <h2>BankSphere</h2>
            <p>Banking Management</p>
          </div>
        </div>

        <p className="sidebar-label">MAIN MENU</p>

        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <button
              type="button"
              key={item.name}
              className={
                activePage === item.name
                  ? 'nav-item active'
                  : 'nav-item'
              }
              onClick={() => openPage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p>Banking Management System</p>
          <button
            type="button"
            className="sidebar-login"
            onClick={isLoggedIn ? handleLogout : openLogin}
          >
            {isLoggedIn ? '⇥ Logout' : '⇥ Login'}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div>
            <h1>{activePage}</h1>
            <p>Manage your banking operations in one place.</p>
          </div>

          <button
            type="button"
            className="header-login"
            onClick={isLoggedIn ? handleLogout : openLogin}
          >
            {isLoggedIn ? 'Logout' : '⇥ Login'}
          </button>
        </header>

        {message && (
          <p role="status" className="message">
            {message}
          </p>
        )}

        {loading && <p>Loading...</p>}

        {activePage === 'Dashboard' && (
          <>
            <div className="dashboard-summary">
              <div className="summary-card">
                <h3>Total Customers</h3>
                <p>{customers.length}</p>
              </div>

              <div className="summary-card">
                <h3>Total Accounts</h3>
                <p>{accounts.length}</p>
              </div>

              <div className="summary-card">
                <h3>Total Balance</h3>
                <p>
                  ₹{totalBalance.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <section className="card">
              <h2>Welcome to Banking Management System</h2>
              <p>
                Register customers, create bank accounts, manage
                transactions and view account details.
              </p>
            </section>

            <section className="card">
              <h2>Recent Accounts</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Account Number</th>
                      <th>Customer ID</th>
                      <th>Account Type</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.slice(0, 5).map((account, index) => (
                      <tr key={getAccountNumber(account) || index}>
                        <td>{getAccountNumber(account) || '—'}</td>
                        <td>
                          {account.customerId ??
                            account.customer_id ??
                            '—'}
                        </td>
                        <td>
                          {account.accountType ??
                            account.account_type ??
                            '—'}
                        </td>
                        <td>₹{getBalance(account).toFixed(2)}</td>
                      </tr>
                    ))}

                    {accounts.length === 0 && (
                      <tr>
                        <td colSpan="4">No accounts found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activePage === 'Customers' && (
          <>
            <section className="card">
              <h2>Customer Registration</h2>

              <form onSubmit={handleRegisterCustomer}>
                <label>
                  Full Name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Phone
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Address
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </label>

                <button type="submit">Register Customer</button>
              </form>

              {customerMessage && <p>{customerMessage}</p>}
            </section>

            <section className="card">
              <h2>Registered Customers ({customers.length})</h2>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer, index) => (
                      <tr key={getCustomerId(customer) || index}>
                        <td>{getCustomerId(customer)}</td>
                        <td>{getCustomerName(customer)}</td>
                        <td>{customer.email ?? '—'}</td>
                        <td>{customer.phone ?? '—'}</td>
                      </tr>
                    ))}

                    {customers.length === 0 && (
                      <tr>
                        <td colSpan="4">No customers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activePage === 'Create Account' && (
          <section className="card">
            <h2>Create Bank Account</h2>

            <form onSubmit={handleCreateAccount}>
              <label>
                Select Customer
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer, index) => (
                    <option
                      key={getCustomerId(customer) || index}
                      value={getCustomerId(customer)}
                    >
                      {getCustomerName(customer)} — ID: {getCustomerId(customer)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Account Type
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                >
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
              </label>

              <label>
                Initial Balance (₹)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  required
                />
              </label>

              <button type="submit">Create Account</button>
            </form>

            {accountMessage && <p>{accountMessage}</p>}
          </section>
        )}

        {activePage === 'Bank Accounts' && (
          <section className="card">
            <h2>All Bank Accounts ({accounts.length})</h2>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Account Number</th>
                    <th>Customer ID</th>
                    <th>Account Type</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account, index) => (
                    <tr key={getAccountNumber(account) || index}>
                      <td>{getAccountNumber(account)}</td>
                      <td>
                        {account.customerId ??
                          account.customer_id ??
                          '—'}
                      </td>
                      <td>
                        {account.accountType ??
                          account.account_type ??
                          '—'}
                      </td>
                      <td>₹{getBalance(account).toFixed(2)}</td>
                    </tr>
                  ))}

                  {accounts.length === 0 && (
                    <tr>
                      <td colSpan="4">No accounts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activePage === 'Transactions' && (
          <>
            <section className="card">
              <h2>Deposit / Withdraw Money</h2>

              <label>
                Select Account
                <select
                  value={selectedAccount}
                  onChange={handleAccountChange}
                >
                  <option value="">Select an account</option>
                  {accounts.map((account, index) => {
                    const number = getAccountNumber(account)

                    return (
                      <option key={number || index} value={number}>
                        {number} — ₹{getBalance(account).toFixed(2)}
                      </option>
                    )
                  })}
                </select>
              </label>

              <label>
                Amount (₹)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </label>

              <div className="button-group">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleMoneyOperation('deposit')}
                >
                  Deposit
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleMoneyOperation('withdraw')}
                >
                  Withdraw
                </button>
              </div>
            </section>

            <section className="card">
              <h2>Transaction History</h2>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr
                        key={
                          transaction.transactionId ??
                          transaction.transaction_id ??
                          index
                        }
                      >
                        <td>
                          {transaction.transactionId ??
                            transaction.transaction_id ??
                            index + 1}
                        </td>
                        <td>
                          {transaction.transactionType ??
                            transaction.transaction_type ??
                            transaction.type ??
                            '—'}
                        </td>
                        <td>₹{Number(transaction.amount ?? 0).toFixed(2)}</td>
                        <td>
                          {transaction.transactionDate ??
                            transaction.transaction_date ??
                            transaction.createdAt ??
                            transaction.created_at ??
                            '—'}
                        </td>
                      </tr>
                    ))}

                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan="4">No transactions found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activePage === 'Money Transfer' && (
          <section className="card">
            <h2>Transfer Money</h2>

            <form onSubmit={handleTransfer}>
              <label>
                From Account
                <select
                  value={sourceAccount}
                  onChange={(e) => setSourceAccount(e.target.value)}
                  required
                >
                  <option value="">Select source account</option>
                  {accounts.map((account) => {
                    const number = getAccountNumber(account)

                    return (
                      <option key={number} value={number}>
                        {number} — ₹{getBalance(account).toFixed(2)}
                      </option>
                    )
                  })}
                </select>
              </label>

              <label>
                To Account
                <select
                  value={destinationAccount}
                  onChange={(e) => setDestinationAccount(e.target.value)}
                  required
                >
                  <option value="">Select destination account</option>
                  {accounts
                    .filter(
                      (account) =>
                        getAccountNumber(account) !== sourceAccount
                    )
                    .map((account) => {
                      const number = getAccountNumber(account)

                      return (
                        <option key={number} value={number}>
                          {number} — ₹{getBalance(account).toFixed(2)}
                        </option>
                      )
                    })}
                </select>
              </label>

              <label>
                Amount (₹)
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </label>

              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Transfer Money'}
              </button>
            </form>

            {transferMessage && (
              <p role="status" className="message">
                {transferMessage}
              </p>
            )}
          </section>
        )}

        {activePage === 'Mini Statement' && (
          <section className="card">
            <h2>Mini Statement — Latest Transactions</h2>

            <label>
              Select Account
              <select
                value={selectedAccount}
                onChange={handleAccountChange}
              >
                <option value="">Select an account</option>
                {accounts.map((account, index) => {
                  const number = getAccountNumber(account)

                  return (
                    <option key={number || index} value={number}>
                      {number}
                    </option>
                  )
                })}
              </select>
            </label>

            {miniLoading && <p>Loading Mini Statement...</p>}

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {miniStatement.map((transaction, index) => (
                    <tr
                      key={
                        transaction.transaction_id ??
                        transaction.transactionId ??
                        index
                      }
                    >
                      <td>
                        {transaction.transaction_id ??
                          transaction.transactionId ??
                          index + 1}
                      </td>
                      <td>
                        {transaction.transaction_type ??
                          transaction.transactionType ??
                          '—'}
                      </td>
                      <td>₹{Number(transaction.amount ?? 0).toFixed(2)}</td>
                      <td>{transaction.description ?? '—'}</td>
                      <td>
                        {transaction.transaction_date
                          ? new Date(
                              transaction.transaction_date
                            ).toLocaleString('en-IN')
                          : transaction.transactionDate ?? '—'}
                      </td>
                    </tr>
                  ))}

                  {!miniLoading && miniStatement.length === 0 && (
                    <tr>
                      <td colSpan="5">No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              disabled={miniLoading || !selectedAccount}
              onClick={() => loadMiniStatement(selectedAccount)}
            >
              Refresh Mini Statement
            </button>
          </section>
        )}

        {activePage === 'Beneficiaries' && (
          <>
            <section className="card">
              <h2>
                {editingBeneficiaryId !== null
                  ? 'Edit Beneficiary'
                  : 'Add Beneficiary'}
              </h2>

              <form onSubmit={handleSaveBeneficiary}>
                <label>
                  Select Customer
                  <select
                    value={beneficiaryCustomerId}
                    onChange={handleBeneficiaryCustomerChange}
                    required
                    disabled={editingBeneficiaryId !== null}
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer, index) => (
                      <option
                        key={getCustomerId(customer) || index}
                        value={getCustomerId(customer)}
                      >
                        {getCustomerName(customer)} — ID: {getCustomerId(customer)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Beneficiary Name
                  <input
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Account Number
                  <input
                    value={beneficiaryAccountNumber}
                    onChange={(e) =>
                      setBeneficiaryAccountNumber(e.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  Bank Name
                  <input
                    value={beneficiaryBankName}
                    onChange={(e) => setBeneficiaryBankName(e.target.value)}
                    required
                  />
                </label>

                <label>
                  IFSC Code
                  <input
                    value={beneficiaryIfscCode}
                    onChange={(e) =>
                      setBeneficiaryIfscCode(e.target.value.toUpperCase())
                    }
                    required
                  />
                </label>

                <button type="submit" disabled={beneficiaryLoading}>
                  {beneficiaryLoading
                    ? 'Please wait...'
                    : editingBeneficiaryId !== null
                      ? 'Update Beneficiary'
                      : 'Add Beneficiary'}
                </button>

                {editingBeneficiaryId !== null && (
                  <button
                    type="button"
                    disabled={beneficiaryLoading}
                    onClick={() => {
                      clearBeneficiaryForm()
                      setBeneficiaryMessage('Edit cancelled.')
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>

              {beneficiaryMessage && (
                <p role="status" className="message">
                  {beneficiaryMessage}
                </p>
              )}
            </section>

            <section className="card">
              <h2>Beneficiary List</h2>

              <label>
                Select Customer
                <select
                  value={beneficiaryCustomerId}
                  onChange={handleBeneficiaryCustomerChange}
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer, index) => (
                    <option
                      key={getCustomerId(customer) || index}
                      value={getCustomerId(customer)}
                    >
                      {getCustomerName(customer)} — ID: {getCustomerId(customer)}
                    </option>
                  ))}
                </select>
              </label>

              {beneficiaryLoading && <p>Loading beneficiaries...</p>}

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Account Number</th>
                      <th>Bank</th>
                      <th>IFSC</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficiaries.map((item, index) => {
                      const beneficiaryId =
                        item.beneficiary_id ?? item.beneficiaryId

                      return (
                        <tr key={beneficiaryId ?? index}>
                          <td>{beneficiaryId ?? '—'}</td>
                          <td>
                            {item.beneficiary_name ??
                              item.beneficiaryName ??
                              '—'}
                          </td>
                          <td>
                            {item.account_number ??
                              item.accountNumber ??
                              '—'}
                          </td>
                          <td>{item.bank_name ?? item.bankName ?? '—'}</td>
                          <td>{item.ifsc_code ?? item.ifscCode ?? '—'}</td>
                          <td>
                            <button
                              type="button"
                              disabled={
                                beneficiaryLoading ||
                                beneficiaryId == null
                              }
                              onClick={() => handleEditBeneficiary(item)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={
                                beneficiaryLoading ||
                                beneficiaryId == null
                              }
                              onClick={() =>
                                handleDeleteBeneficiary(beneficiaryId)
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}

                    {!beneficiaryLoading && beneficiaries.length === 0 && (
                      <tr>
                        <td colSpan="6">No beneficiaries found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                disabled={beneficiaryLoading || !beneficiaryCustomerId}
                onClick={() => loadBeneficiaries(beneficiaryCustomerId)}
              >
                Refresh Beneficiaries
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App
