"""Text statistics for the three transcripts -> reference/analysis/script_stats.json"""
import json, re
from common import *
out = {}
syl = lambda w: max(1, len(re.findall(r"[aeiouy]+", re.sub(r"(?<=[^aeiou])e$|es$|ed$", "", w.lower())) ) )
for v in VIDEOS:
    J = json.load(open(os.path.join(AN, "transcripts", v + ".json")))
    S = J["sentences"]; W = [re.sub(r"[^\w']", "", w["word"]) for w in J["words"]]; W = [w for w in W if w]
    L = [s["n_words"] for s in S]
    starts = [s["text"].split()[0].strip(",") for s in S]
    conj = [w for w in starts if w in ("But", "So", "And", "Then", "Until", "Well", "You")]
    nsyl = sum(syl(w) if not w.isdigit() else 3 for w in W)
    r = {"words": len(W), "sentences": len(S), "words_per_sentence": {"mean": round(float(np.mean(L)), 1), "median": float(np.median(L)), "min": min(L), "max": max(L)},
         "sentence_lengths": L, "sentence_openers": starts, "pct_sentences_opening_with_connector": round(100 * len(conj) / len(S)),
         "mean_word_len_chars": round(float(np.mean([len(w) for w in W])), 2),
         "pct_words_1_syllable": round(100 * sum(1 for w in W if syl(w) == 1 and not w.isdigit()) / len(W)),
         "pct_words_3plus_syllables": round(100 * sum(1 for w in W if syl(w) >= 3 and not w.isdigit()) / len(W)),
         "flesch_kincaid_grade_est": round(0.39 * len(W) / len(S) + 11.8 * nsyl / len(W) - 15.59, 1),
         "numbers": [w["word"] for w in J["words"] if re.search(r"\d", w["word"])],
         "first_3s_words": " ".join(w["word"] for w in J["words"] if w["start"] < 3.0),
         "words_by_5s": [sum(1 for w in J["words"] if a <= w["start"] < a + 5) for a in range(0, 70, 5)]}
    out[v] = r; print(v, json.dumps(r))
json.dump(out, open(os.path.join(AN, "script_stats.json"), "w"), indent=1)
