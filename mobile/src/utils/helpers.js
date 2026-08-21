export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
    case 'completed':
      return '#10b981';
    case 'pending':
    case 'pending_review':
      return '#f59e0b';
    case 'cancelled':
    case 'rejected':
      return '#ef4444';
    default:
      return '#64748b';
  }
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatPatientAddress = (patient) => {
  if (!patient) return 'No address';
  const { address, city, state, zip } = patient;
  const parts = [address, city, state, zip].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'No address';
};

export const formatPatientDemographics = (patient) => {
  if (!patient) return '';
  const { age, gender } = patient;
  const parts = [];
  if (age) parts.push(`${age}y`);
  if (gender) parts.push(gender);
  return parts.join(' • ');
};
