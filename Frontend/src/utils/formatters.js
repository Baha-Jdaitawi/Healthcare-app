// Healthcare App Data Formatters

// Date & Time Formatters
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'Date TBD';
  
  try {
    const date = new Date(dateString);
    const defaultOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

export const formatLongDate = (dateString) => {
  return formatDate(dateString, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatShortDate = (dateString) => {
  return formatDate(dateString, {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (timeString) => {
  if (!timeString) return 'Time TBD';
  
  try {
    // Handle both HH:mm and HH:mm:ss formats
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Time formatting error:', error);
    return timeString;
  }
};

export const formatDateTime = (dateString, timeString) => {
  if (!dateString && !timeString) return 'Date & Time TBD';
  if (!dateString) return formatTime(timeString);
  if (!timeString) return formatDate(dateString);
  
  return `${formatDate(dateString)} at ${formatTime(timeString)}`;
};

export const formatRelativeDate = (dateString) => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays === -1) return 'Tomorrow';
    if (diffInDays < 7 && diffInDays > 0) return `${diffInDays} days ago`;
    if (diffInDays > -7 && diffInDays < 0) return `In ${Math.abs(diffInDays)} days`;
    
    return formatDate(dateString);
  } catch (error) {
    console.error('Relative date formatting error:', error);
    return formatDate(dateString);
  }
};

// Name Formatters
export const formatFullName = (firstName, lastName) => {
  if (!firstName && !lastName) return 'Unknown';
  if (!firstName) return lastName;
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`;
};

export const formatDoctorName = (firstName, lastName) => {
  const fullName = formatFullName(firstName, lastName);
  return fullName === 'Unknown' ? 'Unknown Doctor' : `Dr. ${fullName}`;
};

export const formatInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}` || '??';
};

// File Size Formatter
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 KB';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
};

// Phone Number Formatter
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle different phone number lengths
  if (cleaned.length === 10) {
    // US format: (555) 123-4567
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US with country code: +1 (555) 123-4567
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Return original if doesn't match expected formats
  return phoneNumber;
};

// Currency Formatter
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '$0';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `$${amount}`;
  }
};

export const formatConsultationFee = (fee) => {
  return formatCurrency(fee);
};

// Status Formatters
export const formatStatus = (status) => {
  if (!status) return 'Unknown';
  
  // Convert snake_case or kebab-case to Title Case
  return status
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const formatAppointmentStatus = (status) => {
  const statusMap = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'rescheduled': 'Rescheduled'
  };
  
  return statusMap[status] || formatStatus(status);
};

// Rating Formatter
export const formatRating = (rating) => {
  if (!rating) return '0.0';
  
  const numRating = parseFloat(rating);
  return numRating.toFixed(1);
};

export const formatRatingWithStars = (rating, maxRating = 5) => {
  const numRating = parseFloat(rating) || 0;
  const stars = '★'.repeat(Math.floor(numRating)) + '☆'.repeat(maxRating - Math.floor(numRating));
  return `${stars} ${formatRating(rating)}`;
};

// Medical ID Formatters
export const formatMedicalId = (id, type = 'general') => {
  if (!id) return '';
  
  const cleaned = id.replace(/\D/g, '');
  
  switch (type) {
    case 'ssn':
      // XXX-XX-XXXX
      if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
      }
      break;
    case 'insurance':
      // XXXX-XXXX-XXXX
      if (cleaned.length >= 12) {
        return cleaned.match(/.{1,4}/g).join('-');
      }
      break;
    default:
      return id;
  }
  
  return id;
};

// Address Formatter
export const formatAddress = (address) => {
  if (!address) return '';
  
  const { street, city, state, postalCode, country } = address;
  const parts = [street, city, state, postalCode, country].filter(Boolean);
  
  return parts.join(', ');
};

// Age Calculator & Formatter
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  
  try {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Age calculation error:', error);
    return null;
  }
};

export const formatAge = (dateOfBirth) => {
  const age = calculateAge(dateOfBirth);
  return age !== null ? `${age} years old` : 'Age unknown';
};

// Duration Formatter
export const formatDuration = (minutes) => {
  if (!minutes) return '0 minutes';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} minutes`;
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  
  return `${hours}h ${mins}m`;
};

// Experience Formatter
export const formatExperience = (years) => {
  if (!years) return 'New';
  
  const numYears = parseInt(years);
  if (numYears === 1) return '1 year';
  if (numYears < 1) return 'Less than 1 year';
  
  return `${numYears} years`;
};

// Document Type Formatter
export const formatDocumentType = (type) => {
  const typeMap = {
    'prescription': 'Prescription',
    'lab-results': 'Lab Results',
    'x-ray': 'X-Ray',
    'mri': 'MRI Scan',
    'ct-scan': 'CT Scan',
    'report': 'Medical Report',
    'insurance': 'Insurance Document',
    'medical-history': 'Medical History',
    'vaccination-record': 'Vaccination Record',
    'discharge-summary': 'Discharge Summary',
    'referral': 'Referral Letter'
  };
  
  return typeMap[type] || formatStatus(type);
};

// Percentage Formatter
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  
  const numValue = parseFloat(value);
  return `${numValue.toFixed(decimals)}%`;
};

// Text Truncation
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

// Blood Type Formatter
export const formatBloodType = (bloodType) => {
  if (!bloodType) return 'Unknown';
  
  const cleaned = bloodType.toUpperCase().replace(/\s/g, '');
  const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  return validTypes.includes(cleaned) ? cleaned : bloodType;
};

// Appointment Time Slot Formatter
export const formatTimeSlot = (startTime, duration = 30) => {
  if (!startTime) return '';
  
  try {
    const start = formatTime(startTime);
    
    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    const end = formatTime(endDate.toTimeString().slice(0, 5));
    
    return `${start} - ${end}`;
  } catch (error) {
    console.error('Time slot formatting error:', error);
    return startTime;
  }
};

// Export all formatters as a grouped object
export const FORMATTERS = {
  // Date & Time
  formatDate,
  formatLongDate,
  formatShortDate,
  formatTime,
  formatDateTime,
  formatRelativeDate,
  
  // Names
  formatFullName,
  formatDoctorName,
  formatInitials,
  
  // Numbers & Currency
  formatFileSize,
  formatCurrency,
  formatConsultationFee,
  formatRating,
  formatRatingWithStars,
  formatPercentage,
  
  // Contact Info
  formatPhoneNumber,
  formatAddress,
  
  // Medical Data
  formatAge,
  calculateAge,
  formatBloodType,
  formatMedicalId,
  formatDocumentType,
  
  // Status & Categories
  formatStatus,
  formatAppointmentStatus,
  
  // Time & Duration
  formatDuration,
  formatExperience,
  formatTimeSlot,
  
  // Text
  truncateText
};