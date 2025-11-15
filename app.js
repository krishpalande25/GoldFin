// Global state management (instead of localStorage due to sandboxed environment)
let appState = {
  userInfo: null,
  loanCalculation: null,
  applicationId: null
};

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    mobileMenuBtn.setAttribute('aria-expanded', !isOpen);
  });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href !== '#privacy' && href !== '#terms') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        if (!mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
      }
    }
  });
});

// Hero Quick Apply Form Handler
function handleHeroFormSubmit(event) {
  event.preventDefault();
  
  // Clear previous errors
  document.getElementById('heroNameError').classList.add('hidden');
  document.getElementById('heroPhoneError').classList.add('hidden');
  document.getElementById('heroConsentError').classList.add('hidden');
  
  const name = document.getElementById('heroName').value.trim();
  const phone = document.getElementById('heroPhone').value.trim();
  const consent = document.getElementById('heroConsent').checked;
  
  let hasError = false;
  
  // Validation
  if (!name || name.length < 2) {
    document.getElementById('heroNameError').textContent = 'Please enter a valid name';
    document.getElementById('heroNameError').classList.remove('hidden');
    hasError = true;
  }
  
  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    document.getElementById('heroPhoneError').textContent = 'Please enter a valid 10-digit phone number';
    document.getElementById('heroPhoneError').classList.remove('hidden');
    hasError = true;
  }
  
  if (!consent) {
    document.getElementById('heroConsentError').textContent = 'Please accept the terms and conditions';
    document.getElementById('heroConsentError').classList.remove('hidden');
    hasError = true;
  }
  
  if (hasError) return;
  
  // Store user info in memory
  appState.userInfo = { name, phone };
  
  // Show OTP modal
  showOTPModal();
}

// Loan Calculator Functions
function calculateLoan() {
  const loanAmount = parseFloat(document.getElementById('loanAmount').value);
  const tenure = parseInt(document.getElementById('tenure').value);
  const interestRate = parseFloat(document.getElementById('interestRate').value);
  
  // Calculate monthly interest (simple interest for gold loans)
  const monthlyRate = interestRate / 100 / 12;
  const monthlyInterest = loanAmount * monthlyRate;
  const totalInterest = monthlyInterest * tenure;
  const totalPayable = loanAmount + totalInterest;
  
  // Update display with proper INR formatting
  document.getElementById('monthlyInterest').textContent = formatINR(monthlyInterest);
  document.getElementById('totalInterest').textContent = formatINR(totalInterest);
  document.getElementById('totalPayable').textContent = formatINR(totalPayable);
  
  // Generate amortization schedule
  generateAmortizationSchedule(loanAmount, monthlyInterest, tenure);
  
  // Store calculation in memory
  appState.loanCalculation = {
    loanAmount,
    tenure,
    interestRate,
    monthlyInterest,
    totalInterest,
    totalPayable
  };
}

function updateLoanAmount(value) {
  const slider = document.getElementById('loanAmount');
  slider.value = value;
  slider.setAttribute('aria-valuenow', value);
  calculateLoan();
}

function setRate(rate) {
  document.getElementById('interestRate').value = rate;
  
  // Update button styles
  document.querySelectorAll('.rate-btn').forEach(btn => {
    const btnRate = parseInt(btn.getAttribute('data-rate'));
    if (btnRate === rate) {
      btn.classList.add('bg-navy', 'text-white');
      btn.classList.remove('text-navy');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('bg-navy', 'text-white');
      btn.classList.add('text-navy');
      btn.setAttribute('aria-pressed', 'false');
    }
  });
  
  calculateLoan();
}

function generateAmortizationSchedule(principal, monthlyInterest, tenure) {
  const tableBody = document.getElementById('amortizationTable');
  tableBody.innerHTML = '';
  
  // Show first 6 months only
  const monthsToShow = Math.min(6, tenure);
  let remainingBalance = principal;
  
  for (let month = 1; month <= monthsToShow; month++) {
    const row = document.createElement('tr');
    row.className = month % 2 === 0 ? 'bg-gray-50' : 'bg-white';
    row.innerHTML = `
      <td class="px-4 py-3">${month}</td>
      <td class="px-4 py-3 text-right">${formatINR(monthlyInterest)}</td>
      <td class="px-4 py-3 text-right font-semibold">${formatINR(remainingBalance)}</td>
    `;
    tableBody.appendChild(row);
  }
}

function formatINR(amount) {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

// OTP Modal Functions
function showOTPModal() {
  const modal = document.getElementById('otpModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.getElementById('otp1').focus();
  document.body.style.overflow = 'hidden';
}

function closeOTPModal() {
  const modal = document.getElementById('otpModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
  // Clear OTP inputs
  for (let i = 1; i <= 6; i++) {
    document.getElementById(`otp${i}`).value = '';
  }
}

function moveToNext(current, nextIndex) {
  if (current.value.length === 1 && nextIndex <= 6) {
    document.getElementById(`otp${nextIndex + 1}`)?.focus();
  }
}

function handleOTPSubmit(event) {
  event.preventDefault();
  
  // Collect OTP
  let otp = '';
  for (let i = 1; i <= 6; i++) {
    const value = document.getElementById(`otp${i}`).value;
    if (!value) {
      alert('Please enter complete OTP');
      return;
    }
    otp += value;
  }
  
  // Simulate OTP verification (always success in demo)
  setTimeout(() => {
    closeOTPModal();
    // Call mock API to create application
    submitApplication();
  }, 500);
}

function resendOTP() {
  // Simulate OTP resend
  alert('OTP has been resent to your mobile number');
}

// Application Submission
async function submitApplication() {
  try {
    // Simulate API call to /api/apply
    const response = await fetch('/api/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: appState.userInfo?.name || 'Guest User',
        phone: appState.userInfo?.phone || '0000000000',
        loanAmount: appState.loanCalculation?.loanAmount || 100000,
        tenure: appState.loanCalculation?.tenure || 12,
        interestRate: appState.loanCalculation?.interestRate || 14
      })
    }).catch(() => {
      // If API call fails (which it will in static environment), generate UUID client-side
      return {
        ok: true,
        json: async () => ({
          success: true,
          applicationId: generateUUID()
        })
      };
    });
    
    const data = await response.json();
    
    if (data.success) {
      appState.applicationId = data.applicationId;
      showSuccessModal(data.applicationId);
    }
  } catch (error) {
    // Fallback: generate UUID client-side
    const applicationId = generateUUID();
    appState.applicationId = applicationId;
    showSuccessModal(applicationId);
  }
}

function generateUUID() {
  return 'GLF-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Success Modal
function showSuccessModal(applicationId) {
  document.getElementById('applicationId').textContent = applicationId;
  const modal = document.getElementById('successModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
  // Reset form
  document.getElementById('heroQuickApply').reset();
}

// Login Modal
function showLoginModal() {
  const modal = document.getElementById('loginModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.getElementById('loginEmail').focus();
  document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
}

function handleLoginSubmit(event) {
  event.preventDefault();
  // Simulate login
  alert('Login functionality will be implemented with backend integration');
  closeLoginModal();
  // In production, this would authenticate and redirect to dashboard
}

// Dashboard scaffold
function showDashboard() {
  alert('Dashboard: View your active loans, payment history, and account details.\n\nThis is a scaffold - full implementation requires backend integration.');
}

// Contact Form Handler
function handleContactSubmit(event) {
  event.preventDefault();
  
  // Clear previous errors
  document.getElementById('contactNameError').classList.add('hidden');
  document.getElementById('contactEmailError').classList.add('hidden');
  document.getElementById('contactPhoneError').classList.add('hidden');
  document.getElementById('contactMessageError').classList.add('hidden');
  
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();
  const message = document.getElementById('contactMessage').value.trim();
  
  let hasError = false;
  
  // Validation
  if (!name || name.length < 2) {
    document.getElementById('contactNameError').textContent = 'Please enter a valid name';
    document.getElementById('contactNameError').classList.remove('hidden');
    hasError = true;
  }
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('contactEmailError').textContent = 'Please enter a valid email address';
    document.getElementById('contactEmailError').classList.remove('hidden');
    hasError = true;
  }
  
  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    document.getElementById('contactPhoneError').textContent = 'Please enter a valid 10-digit phone number';
    document.getElementById('contactPhoneError').classList.remove('hidden');
    hasError = true;
  }
  
  if (!message || message.length < 10) {
    document.getElementById('contactMessageError').textContent = 'Please enter a message (at least 10 characters)';
    document.getElementById('contactMessageError').classList.remove('hidden');
    hasError = true;
  }
  
  if (hasError) return;
  
  // Simulate form submission
  alert(`Thank you, ${name}! Your message has been received. We'll contact you soon at ${email} or ${phone}.`);
  document.getElementById('contactForm').reset();
}

// FAQ Toggle
function toggleFAQ(index) {
  const answer = document.getElementById(`faq${index}`);
  const button = answer.previousElementSibling;
  const icon = button.querySelector('svg');
  
  const isOpen = !answer.classList.contains('hidden');
  
  if (isOpen) {
    answer.classList.add('hidden');
    icon.style.transform = 'rotate(0deg)';
    button.setAttribute('aria-expanded', 'false');
  } else {
    answer.classList.remove('hidden');
    icon.style.transform = 'rotate(180deg)';
    button.setAttribute('aria-expanded', 'true');
  }
}

// Scroll to sections
function scrollToApply() {
  const applyForm = document.getElementById('heroQuickApply');
  if (applyForm) {
    applyForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('heroName').focus();
  }
}

function scrollToCalculator() {
  const calculator = document.getElementById('calculator');
  if (calculator) {
    calculator.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', () => {
  calculateLoan();
  
  // Sync slider with number input
  const loanAmountSlider = document.getElementById('loanAmount');
  const loanAmountInput = document.getElementById('loanAmountValue');
  
  loanAmountSlider.addEventListener('input', (e) => {
    loanAmountInput.value = e.target.value;
  });
  
  loanAmountInput.addEventListener('input', (e) => {
    let value = parseInt(e.target.value) || 10000;
    if (value < 10000) value = 10000;
    if (value > 1000000) value = 1000000;
    e.target.value = value;
    loanAmountSlider.value = value;
    loanAmountSlider.setAttribute('aria-valuenow', value);
  });
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const otpModal = document.getElementById('otpModal');
    const successModal = document.getElementById('successModal');
    const loginModal = document.getElementById('loginModal');
    
    if (!otpModal.classList.contains('hidden')) closeOTPModal();
    if (!successModal.classList.contains('hidden')) closeSuccessModal();
    if (!loginModal.classList.contains('hidden')) closeLoginModal();
  }
});