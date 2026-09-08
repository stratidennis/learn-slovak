// Every user-facing string, in both UI languages. Slovak content is never translated here.
// Keys are grouped by screen. Add to BOTH objects; the test checks the key sets match.
const en = {
  app: 'Slovenčina',
  nav_home: 'Home', nav_review: 'Review', nav_settings: 'Settings',
  coverage_label: 'of casual Slovak speech', known: 'known', learning: 'learning', review_due: 'Review {n} due', nothing_due: 'nothing due 🎉',
  phase: 'Phase', phase_names: ['Sounds & script', 'Survival', 'The sentence engine', 'Domain tracks', 'Native input'], chunks_word: 'chunks',
  alphabet_btn: 'Alphabet', theme_title: 'theme: {t} (tap to change)',
  // unit
  chunks_btn: 'Chunks', listen_type_btn: 'Listen & type', you_will: 'You will be able to…', grammar_when: 'Grammar, when you need it',
  roleplay: 'Roleplay', roleplay_hint: 'render with pipeline.render_prompt and paste into ChatGPT.', creative: 'Creative', gate: 'Gate', sas: 'SAS',
  romanian_analogy: 'Romanian', back: 'Back', close: 'Close',
  // chunks
  english_toggle: 'English', natives_also: 'Natives also say…', listen_say: 'Listen. Say it out loud. Twice.', next: 'Next →',
  chunks_done: 'Chunks done 🎉', chunks_done_sub: 'Now hear them inside sentences.',
  // lesson
  new_badge: 'new', strict_badge: 'strict', type_heard: 'Type what you heard.', check: 'Check', dont_know: "I don't know",
  revealed: 'Revealed — listen once more, then say it.', tap_word: 'tap a word for its meaning',
  msg_gave_up: "You'll see this one again today.", msg_wrong: "Not yet — you'll see this one again.", msg_diacritics: 'Right, but mind the diacritics', msg_diacritics_strict: ' (strict now)',
  msg_first_time: 'First time. Easy.', msg_good: 'Good.', session_done: 'Session done', nothing_here: 'Nothing to do here yet',
  session_stats: '{ok} right · {warn} diacritics only · {bad} to redo', translation_fallback: '(EN — no Romanian yet)', no_translation: 'no translation for this sentence yet',
  // audio
  replay: 'Replay', slow: 'Slow', slower: 'Slower', tap_to_play: 'tap to play',
  // gloss
  not_in_lexicon: 'Not in the band 1–2 lexicon yet (a name, or a band-3+ word).', cognate: 'Cognate', meaning_shifted: '(meaning shifted)',
  false_friend: 'False friend', ff_ro_means: 'means', ff_sk_means: 'in Slovak means', dictionary: 'JÚĽŠ dictionary ↗', band: 'band', generated: 'generated', draft: 'draft',
  draft_title: 'Not yet checked by a native speaker',
  // registers
  reg: { standard: 'standard', colloquial: 'colloquial', formal: 'formal', regional: 'regional', archaic: 'archaic', vulgar: 'vulgar', insult: 'insult', mild_expletive: 'colloquial' } as Record<string, string>,
  // settings
  settings: 'Settings', language: 'Language', language_hint: 'One language everywhere — glosses, notes, buttons. Slovak stays Slovak.',
  theme: 'Theme', theme_hint: 'auto follows your phone — light by day, dark at night if the phone is scheduled that way.', theme_auto: 'auto', theme_light: 'light', theme_dark: 'dark',
  pron_title: 'Pronunciation guide', pron_ro: 'Romanian respelling', pron_ipa: 'IPA', pron_both: 'Both', pron_off: 'Off',
  pron_hint: 'Respelling: {ex} — CAPS = stressed syllable (always the first), doubled vowel = long, ɦ = voiced h, y = the i-glide. Turn it off once your ear no longer needs it.',
  new_per_lesson: 'New sentences per lesson', new_per_hint: 'Reviews always come first. Lower this if reviews take more than 15 minutes.',
  your_data: 'Your data', data_hint: '{cards} cards · {reviews} reviews · {lemmas} lemmas. Everything lives in this browser — no account, no cloud. Export regularly.',
  export: 'Export JSON', import: 'Import JSON', exported: 'Exported. Keep the file somewhere safe — it is the only copy of your progress.', imported: 'Imported. Reloading…', import_failed: 'Import failed: ',
  sources: 'Sources & licences',
  sources_text: 'Sentences: Tatoeba contributors, CC BY 2.0 FR · Dictionary: English Wiktionary via kaikki.org, CC BY-SA 3.0 · Paradigms & spell-check: hunspell-sk (sk-spell), MPL-2.0 · Audio: Microsoft Edge neural voices (Viktória, Lukáš), personal use · Syllabus: Studia Academica Slovaca, Univerzita Komenského, Témy a ciele A1/A2, CC BY-NC-SA 4.0 · Illustrations: unDraw · Chunks, glosses and notes are drafts by this project and are marked "draft" until a native speaker reviews them.',
  personal_use: 'Personal, non-commercial use.',
  // alphabet
  abeceda_sub: "46 letters · 🔊 = the letter's name (for spelling your name) · tap a word to hear it",
  guide_how: 'How to read the guide under every word:', guide_text: 'a respelling using only sounds you already have. CAPS = stressed syllable (always the first), doubled vowel = long, ɦ = the voiced h, y = the y-glide. The four things to train: length, ť/ď/ň/ľ, h vs ch, first-syllable stress.',
  letter_name: 'name', diphthongs_title: 'Diphthongs — one syllable', loading: '…',
  // lesson engine
  step_intro: 'New. Listen, read, say it once.', got_it: 'Got it →', step_meaning: 'What does this mean?', step_form_audio: 'What did you hear?', step_form_text: 'Which one is it in Slovak?',
  step_letterpick: 'Which letter did you hear?', step_anchor: 'How does this letter sound?', step_match: 'Match the pairs', step_tiles: 'Build it in Slovak', tiles_hint: 'tap the words in order',
  step_cloze: 'Fill in the missing word', step_typeword: 'Type the missing word', step_typeword_single: 'Type it in Slovak', step_pairab: 'Which one did you hear?',
  fb_correct: 'Correct!', fb_wrong: 'Not this time', fb_diacritics: 'Right — mind the diacritics', continue: 'Continue',
  session_summary: '{ok} correct · {bad} to revisit · {adv} steps up', unit_progress: '{done} of {total} items mastered', another_session: 'Another session',
  start_lesson: 'Start lesson', continue_lesson: 'Continue', items_word: 'items', minutes_est: '~{n} min',
  lessons_done: 'This unit is mastered — sessions now just keep it fresh.',
}
const ro: typeof en = {
  app: 'Slovenčina',
  nav_home: 'Acasă', nav_review: 'Recapitulare', nav_settings: 'Setări',
  coverage_label: 'din slovaca vorbită de zi cu zi', known: 'știute', learning: 'în învățare', review_due: 'Recapitulează {n}', nothing_due: 'nimic de recapitulat 🎉',
  phase: 'Faza', phase_names: ['Sunete și scriere', 'Supraviețuire', 'Motorul de propoziții', 'Domenii', 'Conținut nativ'], chunks_word: 'expresii',
  alphabet_btn: 'Alfabet', theme_title: 'temă: {t} (apasă pentru a schimba)',
  chunks_btn: 'Expresii', listen_type_btn: 'Ascultă și scrie', you_will: 'Vei putea…', grammar_when: 'Gramatică, atunci când ai nevoie',
  roleplay: 'Joc de rol', roleplay_hint: 'generează cu pipeline.render_prompt și lipește în ChatGPT.', creative: 'Creativ', gate: 'Prag', sas: 'SAS',
  romanian_analogy: 'Analogie', back: 'Înapoi', close: 'Închide',
  english_toggle: 'Engleză', natives_also: 'Nativii mai spun…', listen_say: 'Ascultă. Spune cu voce tare. De două ori.', next: 'Următorul →',
  chunks_done: 'Expresii terminate 🎉', chunks_done_sub: 'Acum ascultă-le în propoziții.',
  new_badge: 'nou', strict_badge: 'strict', type_heard: 'Scrie ce ai auzit.', check: 'Verifică', dont_know: 'Nu știu',
  revealed: 'Dezvăluit — mai ascultă o dată, apoi spune-l.', tap_word: 'atinge un cuvânt pentru sens',
  msg_gave_up: 'Îl vei mai vedea azi.', msg_wrong: 'Nu încă — îl vei mai vedea.', msg_diacritics: 'Corect, dar atenție la diacritice', msg_diacritics_strict: ' (acum strict)',
  msg_first_time: 'Prima dată. Ușor.', msg_good: 'Bine.', session_done: 'Sesiune încheiată', nothing_here: 'Nimic de făcut aici încă',
  session_stats: '{ok} corecte · {warn} doar diacritice · {bad} de refăcut', translation_fallback: '(EN — încă nu există traducere în română)', no_translation: 'încă nu există traducere pentru această propoziție',
  replay: 'Redă', slow: 'Lent', slower: 'Mai lent', tap_to_play: 'atinge pentru redare',
  not_in_lexicon: 'Nu e încă în lexiconul benzilor 1–2 (un nume, sau un cuvânt din banda 3+).', cognate: 'Cuvânt înrudit', meaning_shifted: '(sensul s-a schimbat)',
  false_friend: 'Prieten fals', ff_ro_means: 'înseamnă', ff_sk_means: 'în slovacă înseamnă', dictionary: 'dicționarul JÚĽŠ ↗', band: 'banda', generated: 'generat', draft: 'schiță',
  draft_title: 'Neverificat încă de un vorbitor nativ',
  reg: { standard: 'standard', colloquial: 'colocvial', formal: 'formal', regional: 'regional', archaic: 'arhaic', vulgar: 'vulgar', insult: 'insultă', mild_expletive: 'colocvial' },
  settings: 'Setări', language: 'Limbă', language_hint: 'O singură limbă peste tot — sensuri, note, butoane. Slovaca rămâne slovacă.',
  theme: 'Temă', theme_hint: 'auto urmează telefonul — deschisă ziua, întunecată noaptea, dacă telefonul e programat așa.', theme_auto: 'auto', theme_light: 'deschisă', theme_dark: 'întunecată',
  pron_title: 'Ghid de pronunție', pron_ro: 'Transcriere românească', pron_ipa: 'IPA', pron_both: 'Ambele', pron_off: 'Oprit',
  pron_hint: 'Transcriere: {ex} — MAJUSCULE = silaba accentuată (mereu prima), vocală dublată = lungă, ɦ = h sonor, y = i semivocalic. Oprește-l când urechea nu mai are nevoie.',
  new_per_lesson: 'Propoziții noi pe lecție', new_per_hint: 'Recapitulările vin întotdeauna întâi. Scade dacă recapitulările durează peste 15 minute.',
  your_data: 'Datele tale', data_hint: '{cards} carduri · {reviews} recapitulări · {lemmas} leme. Totul stă în acest browser — fără cont, fără cloud. Exportă regulat.',
  export: 'Exportă JSON', import: 'Importă JSON', exported: 'Exportat. Păstrează fișierul într-un loc sigur — e singura copie a progresului tău.', imported: 'Importat. Se reîncarcă…', import_failed: 'Importul a eșuat: ',
  sources: 'Surse și licențe',
  sources_text: 'Propoziții: contribuitorii Tatoeba, CC BY 2.0 FR · Dicționar: Wiktionary în engleză via kaikki.org, CC BY-SA 3.0 · Paradigme și corector: hunspell-sk (sk-spell), MPL-2.0 · Audio: vocile neurale Microsoft Edge (Viktória, Lukáš), uz personal · Programă: Studia Academica Slovaca, Univerzita Komenského, Témy a ciele A1/A2, CC BY-NC-SA 4.0 · Ilustrații: unDraw · Expresiile, sensurile și notele sunt schițe ale acestui proiect și sunt marcate „schiță” până le verifică un vorbitor nativ.',
  personal_use: 'Uz personal, necomercial.',
  abeceda_sub: '46 de litere · 🔊 = numele literei (pentru a-ți spune numele pe litere) · atinge un cuvânt ca să-l auzi',
  guide_how: 'Cum citești ghidul de sub fiecare cuvânt:', guide_text: 'o transcriere doar cu sunete pe care le ai deja. MAJUSCULE = silaba accentuată (mereu prima), vocală dublată = lungă, ɦ = h-ul sonor, y = i-ul semivocalic din „iar”. Cele patru lucruri de antrenat: lungimea, ť/ď/ň/ľ, h vs ch, accentul pe prima silabă.',
  letter_name: 'nume', diphthongs_title: 'Diftongi — o singură silabă', loading: '…',
  step_intro: 'Nou. Ascultă, citește, spune-l o dată.', got_it: 'Am înțeles →', step_meaning: 'Ce înseamnă?', step_form_audio: 'Ce ai auzit?', step_form_text: 'Care e în slovacă?',
  step_letterpick: 'Ce literă ai auzit?', step_anchor: 'Cum sună litera asta?', step_match: 'Potrivește perechile', step_tiles: 'Construiește în slovacă', tiles_hint: 'atinge cuvintele în ordine',
  step_cloze: 'Completează cuvântul lipsă', step_typeword: 'Scrie cuvântul lipsă', step_typeword_single: 'Scrie-l în slovacă', step_pairab: 'Care dintre ele ai auzit?',
  fb_correct: 'Corect!', fb_wrong: 'Nu de data asta', fb_diacritics: 'Corect — atenție la diacritice', continue: 'Continuă',
  session_summary: '{ok} corecte · {bad} de revăzut · {adv} trepte în plus', unit_progress: '{done} din {total} elemente stăpânite', another_session: 'Încă o sesiune',
  start_lesson: 'Începe lecția', continue_lesson: 'Continuă', items_word: 'elemente', minutes_est: '~{n} min',
  lessons_done: 'Unitatea e stăpânită — sesiunile doar o mai împrospătează.',
}
export const STRINGS = { en, ro }
export type Strings = typeof en
/** tiny interpolation: fmt(t.review_due, {n: 3}) */
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}
