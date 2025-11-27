/**
 * Detects person names in text using heuristics (no AI)
 * Uses a whitelist of common first names + contextual patterns
 */

// Common first names (covers most English-speaking names)
const COMMON_FIRST_NAMES = new Set([
  // Male names
  'Aaron', 'Adam', 'Adrian', 'Alan', 'Albert', 'Alex', 'Alexander', 'Andrew', 'Anthony', 'Antonio',
  'Austin', 'Ben', 'Benjamin', 'Bill', 'Billy', 'Blake', 'Bob', 'Bobby', 'Brad', 'Bradley',
  'Brandon', 'Brian', 'Bruce', 'Bryan', 'Caleb', 'Cameron', 'Carl', 'Carlos', 'Chad', 'Charles',
  'Charlie', 'Chris', 'Christian', 'Christopher', 'Cody', 'Colin', 'Connor', 'Craig', 'Dan', 'Daniel',
  'Danny', 'Dave', 'David', 'Dennis', 'Derek', 'Dominic', 'Don', 'Donald', 'Doug', 'Douglas',
  'Drew', 'Dylan', 'Ed', 'Eddie', 'Edward', 'Eric', 'Erik', 'Ethan', 'Evan', 'Frank',
  'Fred', 'Gabriel', 'Gary', 'George', 'Gerald', 'Grant', 'Greg', 'Gregory', 'Harry', 'Henry',
  'Hunter', 'Ian', 'Isaac', 'Jack', 'Jackson', 'Jacob', 'Jake', 'James', 'Jason', 'Jay',
  'Jeff', 'Jeffrey', 'Jeremy', 'Jerry', 'Jesse', 'Jim', 'Jimmy', 'Joe', 'Joel', 'John',
  'Johnny', 'Jon', 'Jonathan', 'Jordan', 'Jose', 'Joseph', 'Josh', 'Joshua', 'Juan', 'Justin',
  'Keith', 'Ken', 'Kenneth', 'Kevin', 'Kyle', 'Lance', 'Larry', 'Leo', 'Liam', 'Logan',
  'Louis', 'Lucas', 'Luis', 'Luke', 'Marcus', 'Mark', 'Martin', 'Mason', 'Matt', 'Matthew',
  'Max', 'Michael', 'Mike', 'Nathan', 'Nathaniel', 'Neil', 'Nick', 'Nicholas', 'Noah', 'Oliver',
  'Oscar', 'Owen', 'Patrick', 'Paul', 'Peter', 'Philip', 'Randy', 'Ray', 'Raymond', 'Richard',
  'Rick', 'Rob', 'Robert', 'Roger', 'Ron', 'Ronald', 'Ross', 'Russell', 'Ryan', 'Sam',
  'Samuel', 'Scott', 'Sean', 'Sebastian', 'Seth', 'Shane', 'Shawn', 'Simon', 'Spencer', 'Stephen',
  'Steve', 'Steven', 'Taylor', 'Terry', 'Thomas', 'Tim', 'Timothy', 'Todd', 'Tom', 'Tommy',
  'Tony', 'Travis', 'Trevor', 'Troy', 'Tyler', 'Victor', 'Vincent', 'Walter', 'Wayne', 'Will',
  'William', 'Zach', 'Zachary',
  // Female names
  'Abby', 'Abigail', 'Adriana', 'Alexandra', 'Alexis', 'Alice', 'Alicia', 'Allison', 'Amanda', 'Amber',
  'Amy', 'Ana', 'Andrea', 'Angela', 'Angelina', 'Ann', 'Anna', 'Anne', 'Annie', 'Ashley',
  'Audrey', 'Barbara', 'Becky', 'Beth', 'Bethany', 'Betty', 'Beverly', 'Brenda', 'Brittany', 'Brooke',
  'Caitlin', 'Carla', 'Carmen', 'Carol', 'Caroline', 'Carolyn', 'Carrie', 'Casey', 'Cassandra', 'Catherine',
  'Charlotte', 'Chelsea', 'Cheryl', 'Christina', 'Christine', 'Cindy', 'Claire', 'Clara', 'Claudia', 'Colleen',
  'Courtney', 'Crystal', 'Cynthia', 'Dana', 'Danielle', 'Debbie', 'Deborah', 'Denise', 'Diana', 'Diane',
  'Donna', 'Dorothy', 'Elena', 'Elizabeth', 'Ellen', 'Emily', 'Emma', 'Erica', 'Erin', 'Eva',
  'Evelyn', 'Faith', 'Felicia', 'Frances', 'Gabriella', 'Gina', 'Gloria', 'Grace', 'Hailey', 'Hannah',
  'Heather', 'Helen', 'Holly', 'Isabella', 'Jackie', 'Jacqueline', 'Jamie', 'Jane', 'Janet', 'Janice',
  'Jasmine', 'Jean', 'Jenna', 'Jennifer', 'Jenny', 'Jessica', 'Jill', 'Joan', 'Joanna', 'Jocelyn',
  'Jodi', 'Judy', 'Julia', 'Julie', 'Karen', 'Kate', 'Katherine', 'Kathleen', 'Kathryn', 'Katie',
  'Kayla', 'Kelly', 'Kelsey', 'Kendra', 'Kimberly', 'Kristen', 'Kristin', 'Kristina', 'Laura', 'Lauren',
  'Leah', 'Leslie', 'Linda', 'Lindsay', 'Lindsey', 'Lisa', 'Liz', 'Lori', 'Lucy', 'Lynn',
  'Mackenzie', 'Madeline', 'Madison', 'Maggie', 'Mandy', 'Margaret', 'Maria', 'Marie', 'Marilyn', 'Martha',
  'Mary', 'Maya', 'Megan', 'Melanie', 'Melissa', 'Michelle', 'Mia', 'Miranda', 'Molly', 'Monica',
  'Nancy', 'Natalie', 'Natasha', 'Nicole', 'Nina', 'Olivia', 'Paige', 'Pamela', 'Patricia', 'Paula',
  'Peggy', 'Penny', 'Rachel', 'Rebecca', 'Renee', 'Rita', 'Robin', 'Rosa', 'Rose', 'Ruby',
  'Ruth', 'Samantha', 'Sandra', 'Sara', 'Sarah', 'Sharon', 'Sheila', 'Shelby', 'Sherry', 'Shirley',
  'Sofia', 'Sophia', 'Stacy', 'Stephanie', 'Sue', 'Susan', 'Sydney', 'Tammy', 'Tara', 'Teresa',
  'Theresa', 'Tiffany', 'Tina', 'Tracy', 'Valerie', 'Vanessa', 'Veronica', 'Victoria', 'Virginia', 'Wendy',
  'Whitney', 'Zoe',
]);

// Words to always exclude (places, brands, common sentence starters, etc.)
const EXCLUDED_WORDS = new Set([
  // Pronouns, articles, conjunctions
  'I', 'He', 'She', 'It', 'We', 'They', 'You', 'The', 'A', 'An',
  // Common sentence starters
  'This', 'That', 'There', 'These', 'Those', 'Here', 'Where', 'When', 'What', 'Which',
  'Who', 'Why', 'How', 'Also', 'However', 'Although', 'Because', 'Since', 'While', 'After',
  'Before', 'During', 'Then', 'Now', 'Just', 'Still', 'Even', 'Well', 'So', 'But',
  'And', 'Or', 'If', 'As', 'For', 'About', 'Actually', 'Anyway', 'Apparently', 'Basically',
  'Certainly', 'Clearly', 'Definitely', 'Eventually', 'Finally', 'Fortunately', 'Generally', 'Honestly',
  'Hopefully', 'Indeed', 'Instead', 'Interestingly', 'Later', 'Likely', 'Maybe', 'Meanwhile',
  'Moreover', 'Naturally', 'Nevertheless', 'Obviously', 'Often', 'Otherwise', 'Perhaps', 'Personally',
  'Possibly', 'Probably', 'Rather', 'Really', 'Recently', 'Seriously', 'Similarly', 'Simply',
  'Sometimes', 'Soon', 'Specifically', 'Suddenly', 'Supposedly', 'Sure', 'Surely', 'Therefore',
  'Thus', 'Typically', 'Unfortunately', 'Usually',
  // Time-related
  'Today', 'Tomorrow', 'Yesterday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
  'Saturday', 'Sunday', 'January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December', 'Morning', 'Afternoon', 'Evening', 'Night',
  // Common nouns often capitalized
  'New', 'Old', 'Good', 'Bad', 'Big', 'Small', 'First', 'Last', 'Next', 'Previous',
  'Great', 'Best', 'Most', 'Very', 'Much', 'Many', 'Some', 'Any', 'All', 'Every',
  'Other', 'Another', 'Such', 'Only', 'Same', 'Different', 'Important', 'Main', 'Major',
  // Tech/brands commonly mentioned
  'Google', 'Apple', 'Amazon', 'Facebook', 'Microsoft', 'Netflix', 'Twitter', 'Instagram',
  'iPhone', 'Android', 'Windows', 'Mac', 'Gmail', 'YouTube', 'Uber', 'Lyft', 'Zoom',
  'Slack', 'Teams', 'Discord', 'Reddit', 'LinkedIn', 'Pinterest', 'Snapchat', 'TikTok',
  // Places - US States
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Tennessee', 'Texas',
  'Utah', 'Vermont', 'Virginia', 'Washington', 'Wisconsin', 'Wyoming',
  // Major cities
  'London', 'Paris', 'Tokyo', 'Beijing', 'Shanghai', 'Mumbai', 'Delhi', 'Sydney', 'Melbourne',
  'Toronto', 'Vancouver', 'Berlin', 'Madrid', 'Rome', 'Moscow', 'Dubai', 'Singapore', 'Seoul',
  'Bangkok', 'Chicago', 'Boston', 'Seattle', 'Denver', 'Dallas', 'Houston', 'Phoenix', 'Atlanta',
  'Miami', 'Detroit', 'Philadelphia', 'Brooklyn', 'Manhattan', 'Queens', 'Bronx', 'Portland', 'Austin',
  // Countries
  'America', 'England', 'France', 'Germany', 'Italy', 'Spain', 'China', 'Japan', 'Korea',
  'India', 'Canada', 'Australia', 'Brazil', 'Mexico', 'Russia', 'Africa', 'Europe', 'Asia',
  // Generic nouns
  'Internet', 'Company', 'University', 'College', 'School', 'Hospital', 'Church', 'Bank', 'Hotel',
  'Restaurant', 'Airport', 'Station', 'Street', 'Avenue', 'Road', 'Park', 'Beach', 'Mountain',
  'Lake', 'River', 'Ocean', 'North', 'South', 'East', 'West', 'Central', 'Downtown',
]);

// Patterns that indicate a word is likely a name (word before/after context)
const NAME_PRECEDING_WORDS = ['with', 'met', 'saw', 'called', 'named', 'told', 'asked', 'texted', 'emailed', 'messaged', 'contacted', 'visited', 'helped', 'thanked', 'invited', 'introduced', 'mentioned', 'remembered', 'forgot', 'miss', 'love', 'like', 'know', 'knew', 'meet', 'see', 'call', 'text', 'email'];
const NAME_FOLLOWING_WORDS = ['said', 'told', 'asked', 'called', 'texted', 'mentioned', 'suggested', 'recommended', 'helped', 'invited', 'wanted', 'needs', 'needed', 'thinks', 'thought', 'says', 'was', 'is', 'and'];

export function detectNames(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const detectedNames: string[] = [];
  const seen = new Set<string>();

  // Split into sentences to track sentence boundaries
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      // Remove punctuation
      const cleanWord = word.replace(/[.,!?;:()"']/g, '');

      // Skip if not capitalized or too short
      if (
        cleanWord.length < 2 ||
        cleanWord[0] !== cleanWord[0].toUpperCase() ||
        cleanWord[0] === cleanWord[0].toLowerCase()
      ) {
        continue;
      }

      // Check if it's a known first name (check this BEFORE exclusions so names like Sydney aren't blocked)
      const isKnownName = COMMON_FIRST_NAMES.has(cleanWord);

      if (isKnownName) {
        const lowerWord = cleanWord.toLowerCase();
        if (!seen.has(lowerWord)) {
          seen.add(lowerWord);
          detectedNames.push(cleanWord);
        }
        continue;
      }

      // Skip excluded words (only after checking if it's a known name)
      if (EXCLUDED_WORDS.has(cleanWord)) {
        continue;
      }

      // Skip first word of sentence (unless it passed the known name check above)
      const isFirstWord = i === 0;
      if (isFirstWord) {
        continue;
      }

      // Check for contextual patterns (word before suggests it's a name)
      const prevWord = i > 0 ? words[i - 1].toLowerCase().replace(/[.,!?;:()"']/g, '') : '';
      const nextWord = i < words.length - 1 ? words[i + 1].toLowerCase().replace(/[.,!?;:()"']/g, '') : '';

      const hasNameContext =
        NAME_PRECEDING_WORDS.includes(prevWord) ||
        NAME_FOLLOWING_WORDS.includes(nextWord);

      if (hasNameContext) {
        const lowerWord = cleanWord.toLowerCase();
        if (!seen.has(lowerWord)) {
          seen.add(lowerWord);
          detectedNames.push(cleanWord);
        }
      }
    }
  }

  return detectedNames;
}
