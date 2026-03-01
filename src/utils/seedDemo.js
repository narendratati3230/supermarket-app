// utils/seedDemo.js
// Called once on app startup to seed demo account if needed
export function seedDemoAccount() {
  const users = JSON.parse(localStorage.getItem('freshmart_users') || '[]');
  const demoExists = users.find(u => u.email === 'demo@freshmart.com');
  if (!demoExists) {
    users.push({
      id: 999,
      name: 'Demo User',
      email: 'demo@freshmart.com',
      password: 'demo123',
      phone: '+1 (555) 123-4567',
      address: '123 Demo Street',
      city: 'New York',
      createdAt: new Date('2025-01-01').toISOString(),
    });
    localStorage.setItem('freshmart_users', JSON.stringify(users));
  }
}
