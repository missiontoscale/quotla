/**
 * Dashboard greetings collection
 * A diverse set of greetings in multiple languages and motivational phrases
 * to welcome users to the dashboard
 */

export const greetings = [
  // Time-based greetings
  'Good morning . . .',
  'Good afternoon . . .',
  'Good evening . . .',
  'Rise and shine!',
  'Top of the morning to you!',

  // Casual & Fun
  'Howdy, cowboy!',
  "Y'ello, what's cooking today?",
  "Hey Champ, money to be made!",
  'Wassup, future tycoon?',
  "What's the word?",
  "What's the good news?",
  'Ready to rock?',
  'Lock and loaded?',

  // Nigerian Pidgin & Local
  'How far nau?',
  'Wetin dey happen?',
  'Oya, make we work!',
  'Na we dey run am!',

  // International Greetings
  'Hola, amigo!',
  'Salut, mon ami!',
  'Ciao, amico!',
  'Hallo, Freund!',
  'Hej, kompis!',
  'Olá, amigo!',
  'Namaste, dost!',
  'Kilonshele, bawo l\'oja?',
  'Kedu?',
  'Bonjour!',
  'Sannu!',
  'Konnichiwa!',
  'Jambo!',
  'Shalom!',
  'As-salamu alaykum!',
  'Sawubona!',
  'Merhaba!',
  'Salam!',

  // Motivational & Hustle
  'The hustle never stops!',
  'Rise and grind!',
  'Seize the day!',
  'Make it happen!',
  'Let\'s get to work!',
  'Time is money!',
  'Stay focused, stay rich!',
  'Dream big, hustle hard!',
  'Grind now, shine later!',
  'Create your own luck!',
  'Chase the vision, not the money!',
  'Work hard in silence, let success make the noise!',
  'The best way to predict the future is to create it!',
  'Success is not for the lazy!',
  'Hustle beats talent when talent doesn\'t hustle!',
  'Wake up with determination, go to bed with satisfaction!',
  'Make today count!',
  'You got this!',
  'Let\'s build an empire!',
  'Onward and upward!',
  'To the moon!',
  'Keep pushing forward!',
  'Stay hungry, stay earning!',
  'Make waves today!',
  'Build, scale, repeat!',
  'Your empire awaits!',
  'Embrace the grind!',
  'Today, we create wealth.',
  'No excuses, just results!',
  'Momentum is everything!',
  'Fortune favors the bold!',
  'Make your move!',
  'Game time!',
  'Success starts now!',
  'Own your day!',
  'Leave your mark!',
  'Excellence is the goal!',
  'Commit to greatness!',
  'Be unstoppable!',
  'Turn dreams into plans!',
  'Action speaks louder!',
  'Get after it!',
  'No limits today!',
  'Write your story!',
  'Be legendary!',
  'Crush your goals!',
  'Make magic happen!',
  'Your time is now!',
]

/**
 * Get a random greeting from the collection
 */
export function getRandomGreeting(): string {
  return greetings[Math.floor(Math.random() * greetings.length)]
}
