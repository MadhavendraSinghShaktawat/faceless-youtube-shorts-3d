# Script: research and writing

Evidence: `reference/analysis/script.md` and `reference/analysis/transcripts/`.

## Who does what

1. The user gives a topic, a category ("weird prison experiments") or a finished idea.
2. Claude researches and writes the script.
3. The user approves or edits it.
4. **The user records or generates the voiceover and puts the file in `videos/<slug>/audio/`.** Claude never synthesises speech, never calls a text-to-speech service, and never invents a voice track. If no voiceover file exists, stop and ask for it.
5. Timing comes from the real voiceover (word-level transcription), never from an estimate.

If the user brings their own script, check it against the budget below and say what is over.

## Research (when the user gives only a topic)

- Search the web for 3 to 5 candidate stories. A story fits when it has: one person doing something that looks pointless or backwards, a physical object at its centre, one exact number, and an ending that reverses what the viewer expects.
- Check each candidate against at least two independent sources. The script names no person, place or year (that is the style), but the story must still be real. Tell the user which parts are documented and which are embellishment. Do not present a legend as fact.
- Offer the candidates as one-line hooks and let the user pick.

## Length budget [measured pace: 3.65 words per second]

| Target | Words | Sentences | Comic beats |
| --- | --- | --- | --- |
| 30 s | 104 to 112 | 10 to 11 | 1 to 2 |
| 35 s | 122 to 131 | 12 to 13 | 2 |
| 40 s | 139 to 150 | 13 to 15 | 2 |

Hard ceiling: 150 words. Count them before showing the user.

## Template

```
[HOOK]         <He/She/They> <past-tense physical verb> <concrete object> <detail that makes it look pointless>.
               7 to 11 words, finished by 3 s. No name, date, place or question.
[DEEPEN]       "And not just any <X>."  /  "because <stakes>, and while everyone else <sensible thing>, he's still <odd thing>."
               /  a bystander: "So we're <the act, restated as absurd>?"
[JOKE]         One dry line from a character or the narrator. Before 10 s.
[RULE]         "Then he gives them one strange rule."  /  "But it gets weirder."
               Bring in the signature number or the object the ending turns on.
[ESCALATE]     1 to 2 concrete steps in present tense, one image each. Keep the key word unsaid.
[TURN]         "Until one night..."  /  "That's when..."
[FINAL LINE]   "But/And <flat statement of the reversal>, <signature number or opening image>."
               16 to 20 words, the last 4.5 to 5 s. Stop.
```

Beat timing for 40 s: hook 0 to 3, deepen 3 to 7, joke 7 to 10, rule 10 to 15, escalate 15 to 25, turn 25 to 32, (explain 32 to 35 or fold it into the final line), final line last 5 s.
For 30 s: hook 0 to 2.5, deepen 2.5 to 5, joke 5 to 7.5, rule 7.5 to 11, escalate 11 to 18, turn 18 to 24, final line last 5 s. No separate explanation.

## Rules [all seen in all three references]

1. First word is a pronoun. First verb is physical and past tense. The act looks wrong, wasteful or tiny against the stakes.
2. No names, places or years. Roles only: "a scientist", "the rich guy", "his commander".
3. One exact number. Say it in the first third and again in the final sentence (15 minutes, 82 holes, 10 years then 10 feet).
4. Present tense after the hook. Past tense only inside a "You see, ..." explanation.
5. Hold back one word or reason until the last quarter. Describe around it ("something long and thin, wrapped in paper").
6. About half the sentences start with But, So, And, Then or Until. Each sentence is a consequence or a reversal.
7. After one or two long sentences, a punch of 2 to 6 words ("The guards are thrilled." "But it gets weirder.").
8. One image per clause. If a clause cannot be drawn as one shot, cut it. This rule is what makes the storyboard possible.
9. Words a nine-year-old knows. Three in four are one syllable. Physical verbs: slams, rips, smashes, tosses, bolts, twists.
10. One or two similes, visual and everyday ("like a human umbrella", "as thick as your arm").
11. A bystander asks the viewer's question once ("Wait, what?").
12. One deliberate pause of 0.4 to 0.7 s, directly before the best short punchline. Mark it in the script for the voice. Everywhere else, 0.15 to 0.3 s between sentences.
13. The final line is a flat ironic statement. No moral, no call to action, no question. On replay it should read as the lead-in to the first line.

## Brief for the voiceover (give this to the user with the approved script)

- Pace about 220 words per minute, even from start to end. A 108-word script should land near 30 s, 145 words near 40 s.
- One voice does the narrator and every character quote, shifting pitch and attitude for quotes.
- Dry or nearly dry recording, no music, no effects. WAV or high-bitrate MP3, mono is fine.
- No silence at the head or tail beyond a few frames. Mark the single comic pause.
- If the delivered file is longer than 40 s, say so and ask whether to trim the script or accept the length. Do not time-stretch the voice.

## After the voiceover arrives

Transcribe it for word timings (the engine does this), read the transcript against the script, fix mis-heard words in the timing file (the references shipped with caption errors such as "never mind" for "never mined"; do not repeat that), then build the shot plan: one row per clause with its start and end time, the image, the set, the camera move and any sound cue.
