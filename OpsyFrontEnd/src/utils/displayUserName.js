/**
 * Label shown in greetings: prefer full name, then email local-part, then generic.
 */
export function displayUserName(user) {
  if (!user) return 'Utilisateur'
  const name = typeof user.name === 'string' ? user.name.trim() : ''
  if (name) return name
  const email = typeof user.email === 'string' ? user.email.trim() : ''
  if (email.includes('@')) return email.split('@')[0]
  return 'Utilisateur'
}
