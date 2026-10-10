/**
 * Pre-Curated Real Indian Cyber Threat & Scam Attack Vectors
 * Used for live Hackathon demonstrations and automated benchmark validation.
 */

export const HACKATHON_SCAM_SCENARIOS = [
  {
    id: 'scenario-electricity',
    title: '⚡ Electricity Power Disconnection Scam',
    category: 'Utility Smishing',
    language: 'English',
    text: 'Dear customer your electricity power will be disconnected tonight at 9:30 PM from electricity office because your previous month bill was not updated. Please immediately contact our power officer at 9876543210. Electricity Board.',
    expectedScoreRange: [75, 100],
    expectedVerdict: 'CRITICAL',
    description: 'Extremely common Indian fraud tactic exploiting fear of power cut to get victims on the phone with a scammer who instructs them to install remote support apps.'
  },
  {
    id: 'scenario-sbi-kyc',
    title: '🏦 SBI YONO KYC Blocked Phishing',
    category: 'Banking Smishing',
    language: 'English',
    text: 'Dear SBI Customer, your YONO account has been suspended today due to pending PAN card verification. Please update immediately at http://onlinesbi.sbi.kyc-verification.xyz/login to avoid permanent freeze.',
    expectedScoreRange: [80, 100],
    expectedVerdict: 'CRITICAL',
    description: 'Combines banking impersonation, fake suspension deadline, and typosquatted deceptive subdomain on a suspicious .xyz TLD.'
  },
  {
    id: 'scenario-phonepe-cashback',
    title: '💸 PhonePe / UPI Cashback Trap',
    category: 'Fintech UPI Lure',
    language: 'English',
    text: 'Congratulations! You won ₹4,999 cashback in your PhonePe account from Diwali scratch card. Click here to claim refund directly to bank account: http://phonepe-reward2024.top/claim',
    expectedScoreRange: [70, 100],
    expectedVerdict: 'CRITICAL',
    description: 'Lures unsuspecting UPI transactors with free money bait leading to a reverse-payment request that drains bank accounts.'
  },
  {
    id: 'scenario-hindi-electricity',
    title: '🇮🇳 Hindi Utility Extortion (बिजली बिल घोटाला)',
    category: 'Regional Smishing',
    language: 'Hindi',
    text: 'प्रिय ग्राहक, आपका बिजली कनेक्शन आज रात 9:30 बजे काट दिया जाएगा क्योंकि पिछले महीने का बिल अपडेट नहीं हुआ है। तुरंत बिजली अधिकारी 9823456789 पर कॉल करें।',
    expectedScoreRange: [75, 100],
    expectedVerdict: 'CRITICAL',
    description: 'Regional Hindi language smishing message designed to defraud non-English speaking citizens in Gujarat and Northern India.'
  },
  {
    id: 'scenario-part-time-job',
    title: '💼 Part-Time YouTube Likes Task Scam',
    category: 'Work-from-Home Fraud',
    language: 'English',
    text: 'Earn ₹3,000 to ₹8,000 daily from home! Simple part-time job liking YouTube videos. No investment needed. Contact HR manager immediately at http://hr-telegram-earn.buzz/work',
    expectedScoreRange: [70, 100],
    expectedVerdict: 'CRITICAL',
    description: 'Targeted at students and job seekers; escalates into cryptocurrency task fraud.'
  },
  {
    id: 'scenario-legit-sbi-otp',
    title: '✅ Legitimate Official SBI Bank OTP (Zero False Positive Test)',
    category: 'Legitimate Banking SMS',
    language: 'English',
    text: '482910 is your OTP for transaction of INR 1,500.00 at Amazon India with SBI Card ending 4091. Do not share OTP with anyone including bank employees. State Bank of India.',
    expectedScoreRange: [0, 25],
    expectedVerdict: 'SAFE',
    description: 'Standard authentic bank transaction OTP. AegisEdge correctly recognizes legitimate context with ZERO false alarm.'
  },
  {
    id: 'scenario-legit-delivery',
    title: '✅ Legitimate Swiggy Delivery Update',
    category: 'Legitimate Delivery SMS',
    language: 'English',
    text: 'Your Swiggy order from Punjabi Dhaba has been picked up by delivery partner Ramesh and is on the way. Expected delivery in 18 minutes. Enjoy your meal!',
    expectedScoreRange: [0, 15],
    expectedVerdict: 'SAFE',
    description: 'Non-financial, authentic transactional message verified safe.'
  }
];
