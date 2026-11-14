# Reference script analysis

Source: word-timed transcripts in `transcripts/<video>.json` and `.txt` (faster-whisper small.en, corrected against the burned-in captions). Text statistics: `script_stats.json` (from `tools/analysis/script_stats.py`). Timings are whisper word times, good to roughly +-0.1 s.

Transcript notes:

- pink-prison: whisper heard "skittiest"; the word is "skinniest" (second transcription pass and context agree).
- mine-salting: whisper heard "boat"; spoken word is "bolt". The creator's own caption shows "bottles," at 45.2 s, and "never mind" where the sense is "never mined" (49.5 s). So the on-screen captions are auto-generated and not proofread.
- Captions show numerals and units ("300 lbs", "2 seconds", "82"), 1-3 words at a time.
- Sentence boundaries in one-cart are whisper's; the narrator chains clauses with "and / because / but / until", so that video has fewer, longer sentences on paper (15) than the other two (21-22) at the same pace.

---

## 1. Numbers at a glance

| | pink-prison | one-cart | mine-salting |
|---|---|---|---|
| Duration | 65.2 s | 66.8 s | 61.0 s |
| Words | 237 | 235 | 231 |
| Words/min | 218 | 211 | 227 |
| Sentences (as transcribed) | 22 | 15 | 21 |
| Words per sentence: mean / median / min / max | 10.8 / 9 / 2 / 29 | 15.7 / 12 / 4 / 31 | 11.0 / 10 / 2 / 27 |
| Mean word length | 4.16 letters | 4.16 | 3.91 |
| One-syllable words | 75 % | 79 % | 84 % |
| Words of 3+ syllables | 3 % | 5 % | 3 % |
| Flesch-Kincaid grade (estimate) | 4.0 | 5.5 | 3.0 |
| Sentences opening with a connector (But / So / And / Then / Until / Well / You see) | 55 % | 27 % (more inside sentences) | 52 % |
| Proper nouns | 1 ("Barbie") | 0 | 0 |
| Numbers spoken | 15 (x5), 20, 300, one pint, a gallon, two seconds, a year | 82 (x3), one rope, one drop | 10 years, hundred bucks, 10 feet |
| Longest pause | 0.52 s before "Barbie's gonna love it in here." | 0.40 s before "But it gets weirder." | 0.70 s before "Completely insane." |

All three run at 3.5-3.8 words per second with no slow section (per-5 s word counts stay between 15 and 23).

---

## 2. pink-prison

**Hook (0.0-3.2 s, 11 words):** "They painted the jail cell pink. And not just any pink."

Mechanics:

- Starts mid-action with an unnamed "They". No greeting, no "did you know", no date, no place.
- Sentence 1 (6 words, 1.8 s) is a plain statement of a strange act. The strangeness is the pairing: jail cell + pink.
- Sentence 2 (5 words) promises there is more to it without saying what. That is the first open loop: why pink, and why this pink?
- Past tense for the hook only.

**Beat sheet**

| Time | Beat | Text (abridged) | Function |
|---|---|---|---|
| 0.0-3.2 | Hook | They painted the jail cell pink. And not just any pink. | odd act, loop 1 opens (why?) |
| 3.4-10.9 | Odd precision | A scientist mixes exactly one pint of red into a gallon of white and makes the guards repaint the whole thing because the first coat was the wrong shade. | specifics prove someone cares a lot; deepens loop 1 |
| 11.2-14.2 | Joke 1 | The guards are thrilled. / "Barbie's gonna love it in here." | deadpan + character quote, 17 % in |
| 14.4-22.0 | Rule | Then he gives them one strange rule. Every prisoner who goes in comes out after exactly 15 minutes, and he waits at the door with a stopwatch. | loop 2 opens (why 15 minutes?) |
| 22.3-28.2 | Test subject | So the first guy they throw in is the biggest inmate in the building. 300 pounds of tattoos, laughing at the walls. | raises stakes with an extreme case |
| 28.6-35.9 | Demonstration | ...the scientist asks the skinniest guard there to arm wrestle him. And the guard slams his hand down in two seconds. | first payoff: it works (55 % in) |
| 36.2-38.5 | Audience proxy | "Wait, what?" / Well, nobody can explain it. | says what the viewer thinks; refuses to explain yet |
| 38.6-42.7 | Scale-up | But within a year, jails all over the country are painting their cells by the truckload. | consequence, widens the story |
| 42.8-52.5 | Turn | Until one night, a guard forgets about the guy in the pink cell. At 15 minutes, he's sitting quietly. At 20, he's pacing. And by the time they open the door, he's trying to rip the bench out of the floor. | rule of three, escalating |
| 52.8-59.8 | Explanation | You see, the scientist swore this pink drained the fight out of anyone in 15 minutes. So jails used it to calm their most violent prisoners. | loop 1 closed at 53-60 s |
| 60.2-65.0 | Final line | But it only works for 15 minutes. Leave someone in any longer and it does the exact opposite. | loop 2 closed; twist |

- **Open loops and payoffs:** why pink (opened 0 s, answered 52.8 s); why exactly 15 minutes (opened 16.6 s, answered 60.2 s, i.e. 44 s later and in the last 5 s). A small payoff at 33-36 s (the arm wrestle) keeps the viewer paid while the main loops stay open.
- **Final line and loop:** the last sentence ends at 65.0 s, 0.2 s before the cut. It does not repeat the first line. It loops by motif: "15 minutes" (5th use) and the pink cell. Replaying into "They painted the jail cell pink" now reads as the cause of what was just shown.
- **Tense / person:** hook in past ("painted"); body in present ("mixes", "gives", "waits", "slams", "forgets"); explanation in past ("swore", "used"); last line in timeless present. Third person; one "You see"; quotes in first person.
- **Humour:** deadpan irony ("The guards are thrilled."), pop-culture one-liner from a character (Barbie), comic contrast (biggest inmate vs skinniest guard), reaction line ("Wait, what?").

---

## 3. one-cart

**Hook (0.0-9.3 s as one chained sentence; first clause 0.0-2.0 s, 7 words):** "He drilled 82 holes into the wood, because down the hill, an army is marching straight for his fort, and while everyone else sharpens swords, he's in the corner still drilling."

Mechanics:

- Unnamed "He" + a precise, odd number (82) + a mundane action.
- "because" at 2.2 s attaches life-or-death stakes to the mundane action instead of explaining it. The gap between the stakes (army) and the response (drilling holes) is the open loop.
- Contrast inside the sentence: everyone else does the sensible thing, he does not.
- Tense slips from past ("drilled") to present ("is marching", "sharpens") inside the first sentence.

**Beat sheet**

| Time | Beat | Text (abridged) | Function |
|---|---|---|---|
| 0.0-9.3 | Hook | He drilled 82 holes into the wood, because ... an army is marching straight for his fort ... he's in the corner still drilling. | odd act + stakes, loop opens (what is he building?) |
| 9.5-12.4 | Joke 1 | His commander asks, "are we fighting them or grating cheese?" | character quote, 14 % in |
| 12.8-13.8 | Re-hook | But it gets weirder. | 4 words, explicit promise |
| 14.0-24.0 | Mystery build | He bolts the wood onto a cart, and into every hole goes something long and thin, wrapped in paper, each with a string. Then he twists all the strings into one rope nobody's allowed to touch. | describes the object without naming it |
| 24.2-28.5 | Gag | One soldier reaches for it, and he slaps his hand so hard the whole fort hears it. | physical comedy, shows how much it matters |
| 28.5-36.3 | Complication | That night, it pours. So he ... lies on top of it like a human umbrella. "One drop gets in there, and we're all dead." | stakes restated by a character; hints at gunpowder |
| 36.5-47.8 | Climax build | The next morning, ladders slam against the walls and the army charges. Everyone screams at him to do something, but he just watches them get closer and closer, until they're packed shoulder to shoulder, close enough to see their teeth. | delay; hero does nothing while danger grows |
| 48.1-50.4 | Trigger | That's when he rips off the coat and lights the rope. | action starts (72 % in) |
| 50.6-59.5 | Reveal | The spark ... splits into 82 tiny flames, and each one hits a tube of gunpowder strapped to an arrow, turning every one of them into a rocket. | the object is finally named at 59 s |
| 59.8-66.5 | Payoff + final line | All 82 blast off the cart at once, flying every which way. But with the army packed that tight, not a single one misses. | loop closed; last clause turns a flaw into the win |

- **Open loop and payoff:** what are the holes for (opened 0 s). Withheld by vague wording ("something long and thin") for 59 s; the word "rocket" lands at 59.2 s. The answer arrives in three steps: gunpowder hint (34-36 s), flames (52 s), rocket (59 s).
- **Final line and loop:** ends 66.46 s, 0.37 s before the cut. Callbacks: "82" for the third time (0.6 s, 53 s, 60 s) and "packed" (46 s set-up, 64 s payoff: the waiting was the plan). Does not repeat the first line; the number ties end to start.
- **Tense / person:** one past-tense verb in the hook, then present tense throughout. Third person, quotes in first person plural ("are we fighting", "we're all dead").
- **Humour:** absurd comparison in a character's mouth (grating cheese), slapstick (the slap), visual simile ("like a human umbrella").

---

## 4. mine-salting

**Hook (0.0-3.5 s, 15 words):** "He loaded the shotgun with gold and fired it into the walls of the mine."

Mechanics:

- Unnamed "He", past tense, one sentence, concrete nouns only (shotgun, gold, walls, mine).
- The oddity is a self-defeating act: destroying something valuable on purpose.
- A second character immediately asks the viewer's question (6.7 s): "So we're shooting gold into a gold mine?"

**Beat sheet**

| Time | Beat | Text (abridged) | Function |
|---|---|---|---|
| 0.0-3.5 | Hook | He loaded the shotgun with gold and fired it into the walls of the mine. | odd act, loop 1 opens |
| 3.8-8.9 | Witness + joke 1 | His buddy just watches the gold vanish into the rock. "So we're shooting gold into a gold mine?" | viewer's question as a punchline, 11 % in |
| 9.1-18.7 | Early explanation | You see, it's called salting. He's dug this mine for 10 years and found nothing but rock. And tomorrow, a rich guy is coming to buy it. So he spent his last hundred bucks on gold dust instead. | loop 1 closed at 9-19 s; loop 2 opens (will the con work?) |
| 18.9-23.2 | Mark arrives + gag | Next morning, the rich guy rolls up in a white suit and bangs his head on the first beam. | slapstick; sets the mark up as a fool |
| 23.3-33.4 | Threat | But he's brought an expert, and the expert isn't stupid. He smashes a chunk of wall, swirls it in a pan ... But under his magnifying glass, every flake is flat. | obstacle, specific tell |
| 33.7-35.5 | Exposure | "Somebody shot this gold into the wall." | the con is caught (57 % in) |
| 35.7-42.8 | Comic reversal | But the rich guy just laughs. "Why would anyone shoot gold into a wall? That's insane!" And his buddy nods. (0.7 s pause) "Completely insane." | truth dismissed as too absurd; echo line |
| 43.1-49.1 | Deal + twist set-up | So the rich guy pays up, and while those two bolt with the money, he stays behind and pulls a stick of dynamite out of his suit. | loop 2 closed, loop 3 opens |
| 49.2-54.7 | Fool's move | He's never mined a day in his life. So he just lights it, tosses it down the tunnel like a firecracker, and runs. | short, fast |
| 54.7-60.9 | Final line | And when the dust clears, there's a vein of real gold as thick as your arm, 10 feet past where the last guy gave up. | twist: the conmen sold a real gold mine |

- **Open loops and payoffs:** this one answers the hook early (9 s) and immediately replaces it with a con plot. Three loops in a chain: why shoot gold (0 to 9 s), will the con work (16 to 43 s), what is the dynamite for (47 to 55 s). No stretch longer than ~27 s without an answer.
- **Final line and loop:** ends 60.94 s, 0.11 s before the cut. Callbacks: "10 years" (11.6 s) becomes "10 feet" (59 s); gold in the mine wall is both the first and the last image. Does not repeat the first line.
- **Tense / person:** hook in past; a past-perfect backstory ("He's dug", "he spent"); present tense from 18.9 s to the end. Third person, "You see" once, "your arm" once (second person used for a size comparison).
- **Humour:** question-as-punchline, slapstick (bangs his head), echo ("That's insane!" / "Completely insane.") with the longest pause in all three videos placed before the echo, simile ("like a firecracker"), dramatic irony in the ending.

---

## 5. What the three share

**Hook pattern.** Unnamed subject pronoun ("They" / "He") + past-tense verb + concrete object + one detail that makes the act look pointless or backwards. 6-15 words, finished inside 1.8-3.5 s. No question, no "this is the story of", no date, place or name. The viewer's "why?" is the hook.

**Second beat within 3-9 s.** Either a deepening detail ("And not just any pink", "because down the hill an army...") or a bystander who voices the viewer's confusion ("So we're shooting gold into a gold mine?").

**First joke by 7-13 s** (11-17 % of runtime), always as a character's spoken line or a deadpan narrator aside. Then roughly one comic beat every 15-20 s: 3 per video.

**Characters are roles, not names:** a scientist, the guards, the biggest inmate, his commander, one soldier, his buddy, the rich guy, the expert. Zero personal names, zero places, zero dates across 703 words. (This also means nothing in the script can be fact-checked by a viewer; whether the stories are true is not something these files can show.)

**One signature number, repeated.** 15 minutes (5 times), 82 (3 times), 10 (twice, years then feet). It appears in the first 20 s and again in the final line. Numbers are exact and attached to physical units (pint, gallon, pounds, seconds, feet, bucks). "exactly" is used twice in pink-prison.

**Tense.** Past tense for the hook sentence, then historical present for the action. Explanations ("You see, ...") drop back to past.

**Connectors drive it.** "But" (3 per video), "So" (1-4), "And", "Then", "Until", "That's when", "You see". About half of all sentences start with one. Each sentence either adds a consequence (So / And / Then) or a reversal (But / Until).

**Sentence shape.** Median 9-12 words. Short punches of 2-6 words ("The guards are thrilled." "But it gets weirder." "Completely insane." "Wait, what?") sit between long chained sentences of 20-31 words that carry action. One-clause, one-image units: nearly every clause can be drawn as one shot.

**Vocabulary.** Grade 3-5.5. 75-84 % one-syllable words. Concrete nouns and physical verbs (slams, rips, smashes, tosses, bolts, twists, drilled, fired). Almost no abstract words; the few there are sit in the explanation beat ("drained the fight", "calm their most violent prisoners").

**Similes, one or two per video, visual and domestic:** "like a human umbrella", "like a firecracker", "as thick as your arm", "close enough to see their teeth", "by the truckload".

**Structure in proportions of runtime:**

| Beat | pink-prison | one-cart | mine-salting |
|---|---|---|---|
| Hook ends | 5 % | 3 % (first clause), 14 % (full sentence) | 6 % |
| First joke | 17-22 % | 14-19 % | 11-15 % |
| Second loop / re-hook | 22 % ("one strange rule") | 19 % ("But it gets weirder") | 15-30 % (the con) |
| First real payoff | 51-55 % (arm wrestle) | 72-75 % (lights the rope) | 55-58 % (expert catches it) |
| Turn ("Until one night" / "That's when" / "So the rich guy pays up") | 66 % | 72 % | 71 % |
| Final line starts | 92 % | 90 % | 90 % |
| Final line length | 18 words, 4.8 s | 24 words, 6.6 s | 25 words, 6.2 s |

**Final line.** Always a reversal or irony delivered as a plain statement, starting with "But" or "And", 18-25 words, 4.8-6.6 s, ending 0.1-0.4 s before the cut. No moral, no call to action, no "follow for more", no question to the audience. It contains the signature number or the opening image, which is what makes a replay feel continuous. None of the three repeats the first line word for word.

---

## 6. Reusable template

```
[HOOK]        <He/She/They> <past-tense physical verb> <concrete object> <detail that makes it look pointless>.
              6-15 words, done by 3.5 s. No names, dates, places, questions.
[DEEPEN]      One of: "And not just any <X>." / "because <stakes>, and while everyone else <sensible thing>, <he's still doing the odd thing>."
              / a bystander: "So we're <restating the act as absurd>?"
[JOKE 1]      A character says one dry line, or the narrator deadpans. By 7-13 s.
[RULE or RE-HOOK]  "Then he gives them one strange rule." / "But it gets weirder." / "You see, it's called <term>."
              Introduce the signature number or the object the ending will turn on.
[ESCALATE]    2-3 concrete steps in present tense, each a single image. Keep the key thing unnamed or unexplained.
              Put one physical gag here.
[SMALL PAYOFF] Something works, or someone catches on. A character reacts ("Wait, what?").
[TURN]        "Until one night..." / "That's when..." / "So <character> <does the expected thing>, and while <others leave>, he <unexpected act>."
[EXPLAIN]     "You see, ..." one or two sentences, past tense. Only if the ending needs it.
[FINAL LINE]  "But/And <plain statement of the reversal>, <signature number or opening image>."
              Stop. Cut 0.1-0.4 s after the last word.
```

### Rules

1. First word is a pronoun, first verb is physical and past tense. The act must look wrong, wasteful or tiny against big stakes.
2. Never name the person, place or year. Use roles ("a scientist", "the rich guy").
3. Pick one exact number. Say it in the first 20 s and again in the last sentence.
4. Switch to present tense after the hook and stay there, except inside "You see" explanations.
5. Withhold one word or reason until the last quarter. Describe around it ("something long and thin, wrapped in paper").
6. Never leave the viewer more than ~25 s without a payoff: either a joke, a demonstration, or a partial answer.
7. Start about half the sentences with But / So / And / Then / Until. Every sentence is a consequence or a reversal.
8. Alternate: a 2-6 word punch after every one or two long sentences.
9. One image per clause. If a clause cannot be drawn as a single shot, cut it.
10. Words a 9-year-old knows. At least three in four words are one syllable. Physical verbs.
11. Three comic beats per minute, at least one spoken by a character, at least one physical. First one before 13 s.
12. One or two similes, both visual and everyday.
13. Give a bystander the viewer's question once ("Wait, what?" / "So we're shooting gold into a gold mine?").
14. The final line is a flat statement of an ironic reversal. No moral, no CTA, no question. It must still make sense as the lead-in to the first line on replay.
15. One deliberate pause only (0.4-0.7 s), directly before the best short punchline. Everything else runs with 0.15-0.3 s between sentences.

---

## 7. Budgets for 30 s and 40 s

Measured pace: 211 / 218 / 227 wpm, mean 219 wpm = 3.65 words/s (3.52-3.78), about 4.8 syllables/s. Speech occupies everything except ~0.15 s at the start and 0.1-0.4 s at the end.

| Target length | Words (at 3.65 w/s) | Safe range (3.52-3.78 w/s) | Sentences | Comic beats | Strong SFX cues (from audio.md) |
|---|---|---|---|---|---|
| 30 s | 108 | 104-112 | 10-11 | 1-2 | 10-19 |
| 35 s | 126 | 122-131 | 12-13 | 2 | 11-22 |
| 40 s | 145 | 139-150 | 13-15 | 2 | 13-25 |

The references are ~63 s / 234 words, so a 30 s script is 46 % of a reference and a 40 s script is 62 %.

### Beat allocation

| Beat | Reference (avg of 3) | 40 s | 30 s |
|---|---|---|---|
| Hook | 0-3.5 s, 6-15 w | 0-3 s, 8-11 w | 0-2.5 s, 7-9 w |
| Deepen (detail or bystander question) | 3.5-10 s, ~25 w | 3-7 s, ~14 w | 2.5-5 s, ~9 w |
| Joke 1 | 10-14 s, ~12 w | 7-10 s, ~10 w | 5-7.5 s, ~8 w, or fold into Deepen |
| Rule / re-hook (signature number) | 14-22 s, ~27 w | 10-15 s, ~18 w | 7.5-11 s, ~13 w |
| Escalation | 22-42 s, ~70 w | 15-25 s, ~36 w | 11-18 s, ~26 w |
| Turn | 42-52 s, ~38 w | 25-32 s, ~26 w | 18-24 s, ~22 w |
| Explanation | 52-60 s, ~27 w | 32-35 s, ~11 w, or fold into final line | cut |
| Final line | last 5-6.5 s, 18-25 w | last 5 s, 18-20 w | last 4.5-5 s, 16-18 w |

### What to keep, compress, cut

Keep at full strength at any length:

- The hook sentence (already only 2-3.5 s).
- The signature number, said at least twice.
- One character quote that is a joke.
- The turn.
- The final line at 16-20 words. It is the reason to replay; do not shorten it below about 4.5 s.

Compress:

- Deepen + Joke 1 into one or two sentences (mine-salting already does this in 9 s).
- Escalation from three steps to two at 40 s and to one at 30 s. Keep the most physical one.
- Rule of three ("At 15... At 20... by the time...") to two terms at 30 s.

Cut first:

- The scale-up beat ("within a year, jails all over the country...").
- The separate audience-proxy line ("Wait, what? Well, nobody can explain it.") at 30 s; keep it at 40 s only if there is no bystander question earlier.
- The standalone explanation. Let the final line carry it ("But it only works for 15 minutes" explains and twists in one sentence).
- A second gag in the same section.
- The complication subplot (the rain night in one-cart) at 30 s.

Loop count: the references run 2-3 loops in 61-67 s. At 40 s use two (hook question + one planted detail paid off in the final line). At 30 s use one loop plus the planted number.

---

## 8. Not determinable from the transcripts

- Whether the stories are historically accurate (no names, dates or places are given to check).
- Whether the scripts were written by a person or generated.
- Which of these devices cause the videos' performance; this analysis describes what the three scripts do, not what made them spread.
