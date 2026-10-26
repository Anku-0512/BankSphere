
const API_BASE_URL = 'http://localhost:8080';

async function readResponse(response) {
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return text;
}

export async function getCustomers() {
  const response = await fetch(`${API_BASE_URL}/api/customers`);

  if (!response.ok) {
    throw new Error('Failed to load customers');
  }

  return response.json();
}

export async function getAccounts() {
  const response = await fetch(`${API_BASE_URL}/api/accounts`);

  if (!response.ok) {
    throw new Error('Failed to load accounts');
  }

  return response.json();
}

export async function depositMoney(accountNumber, amount) {
  const response = await fetch(
    `${API_BASE_URL}/api/accounts/${encodeURIComponent(accountNumber)}/deposit`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: Number(amount) }),
    }
  );

  return readResponse(response);
}

export async function withdrawMoney(accountNumber, amount) {
  const response = await fetch(
    `${API_BASE_URL}/api/accounts/${encodeURIComponent(accountNumber)}/withdraw`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: Number(amount) }),
    }
  );

  return readResponse(response);
}

export async function getTransactionHistory(accountNumber) {
  const response = await fetch(
    `${API_BASE_URL}/api/accounts/${encodeURIComponent(accountNumber)}/transactions`
  );

  if (!response.ok) {
    throw new Error('Failed to load transaction history');
  }

  return response.json();
}

export async function createAccount(customerId, accountType, balance) {
  const response = await fetch(`${API_BASE_URL}/api/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerId: Number(customerId),
      accountType,
      balance: Number(balance),
    }),
  });

  return readResponse(response);
}

export async function registerCustomer(name, email, phone, address) {
  const response = await fetch(`${API_BASE_URL}/api/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      phone,
      address,
    }),
  });

  const data = await response.text();

  if (!response.ok) {
    throw new Error(data || 'Customer registration failed');
  }

  return data;
}

// Get beneficiaries
export async function getBeneficiaries(customerId) {
  const response = await fetch(
    `${API_BASE_URL}/api/customers/${customerId}/beneficiaries`
  );

  if (!response.ok) {
    throw new Error('Failed to load beneficiaries');
  }

  return response.json();
}

// Add beneficiary
export async function addBeneficiary(
  customerId,
  beneficiaryName,
  accountNumber,
  bankName,
  ifscCode
) {
  const response = await fetch(
    `${API_BASE_URL}/api/customers/${customerId}/beneficiaries`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        beneficiaryName,
        accountNumber,
        bankName,
        ifscCode,
      }),
    }
  );

  return readResponse(response);
}

// Update beneficiary
export async function updateBeneficiary(
  customerId,
  beneficiaryId,
  beneficiaryName,
  accountNumber,
  bankName,
  ifscCode
) {
  const response = await fetch(
    `${API_BASE_URL}/api/customers/${customerId}/beneficiaries/${beneficiaryId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        beneficiaryName,
        accountNumber,
        bankName,
        ifscCode,
      }),
    }
  );

  return readResponse(response);
}

// Delete beneficiary
export async function deleteBeneficiary(customerId, beneficiaryId) {
  const response = await fetch(
    `${API_BASE_URL}/api/customers/${customerId}/beneficiaries/${beneficiaryId}`,
    {
      method: 'DELETE',
    }
  );

  return readResponse(response);
}

export async function transferMoney(sourceAccount, destinationAccount, amount) {
  const response = await fetch(
    `${API_BASE_URL}/api/accounts/${encodeURIComponent(sourceAccount)}/transfer`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destinationAccount: destinationAccount,
        amount: Number(amount),
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Money transfer failed.')
  }

  return data.message
}
