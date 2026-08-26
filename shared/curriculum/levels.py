from typing import Dict, List, Any
from pydantic import BaseModel

class LevelCurriculum(BaseModel):
    level_name: str
    language: str = "general"
    objectives: List[str]
    skills: List[str]
    sample_activities: List[str]
    assessment_criteria: str

ENGLISH_LITERACY_CURRICULUM: Dict[str, LevelCurriculum] = {
    "Beginner": LevelCurriculum(
        level_name="Beginner",
        language="english",
        objectives=["Recognize letter sounds and visual letter forms in English."],
        skills=["Phonemic awareness", "Letter identification"],
        sample_activities=["Point to matching letter flashcards", "Sing alphabet sound songs"],
        assessment_criteria="Identifies fewer than 4 out of 5 English letters correctly."
    ),
    "Letter": LevelCurriculum(
        level_name="Letter",
        language="english",
        objectives=["Read simple 2-3 letter English words by blending sounds."],
        skills=["Phonics blending", "CVC word reading"],
        sample_activities=["Build CVC words with letter tiles (e.g., cat, mat)", "Read simple flashcards"],
        assessment_criteria="Correctly reads 4/5 letters, but fewer than 4/5 words."
    ),
    "Word": LevelCurriculum(
        level_name="Word",
        language="english",
        objectives=["Read connected short sentences fluently in English."],
        skills=["Sentence reading", "Sight word recognition"],
        sample_activities=["Guided sentence reading exercises", "Word-to-picture matching"],
        assessment_criteria="Correctly reads 4/5 words, but struggles with short paragraphs."
    ),
    "Paragraph": LevelCurriculum(
        level_name="Paragraph",
        language="english",
        objectives=["Read a short English paragraph (4 lines) and grasp basic context."],
        skills=["Paragraph fluency", "Literal comprehension"],
        sample_activities=["Read short paragraphs aloud", "Answer basic comprehension questions"],
        assessment_criteria="Reads a 4-line paragraph smoothly with 1 or fewer errors."
    ),
    "Story": LevelCurriculum(
        level_name="Story",
        language="english",
        objectives=["Read fluently and answer analytical story questions in English."],
        skills=["Reading comprehension", "Critical thinking"],
        sample_activities=["Story summarizing", "Guided creative story writing"],
        assessment_criteria="Reads a 7-10 line story smoothly and answers main idea questions."
    )
}

SWAHILI_LITERACY_CURRICULUM: Dict[str, LevelCurriculum] = {
    "Beginner": LevelCurriculum(
        level_name="Beginner",
        language="swahili",
        objectives=["Kutambua sauti na maumbo ya herufi za Kiswahili."],
        skills=["Utambuzi wa herufi", "Ufahamu wa sauti za herufi"],
        sample_activities=["Kutaja herufi kwenye kadi", "Michezo ya kutambua herufi"],
        assessment_criteria="Anatambua chini ya herufi 4 kati ya 5 za Kiswahili."
    ),
    "Letter": LevelCurriculum(
        level_name="Letter",
        language="swahili",
        objectives=["Kusoma silabi na maneno mepesi ya Kiswahili."],
        skills=["Kuunganisha silabi", "Kusoma maneno ya msingi"],
        sample_activities=["Kuunda maneno kwa kadi za silabi (mfn. ma-ma, ba-ba)", "Kusoma kadi za maneno"],
        assessment_criteria="Anasoma herufi 4/5 kwa usahihi, lakini anatambua chini ya maneno 4/5."
    ),
    "Word": LevelCurriculum(
        level_name="Word",
        language="swahili",
        objectives=["Kusoma sentensi fupi za Kiswahili kwa ufasaha."],
        skills=["Kusoma sentensi", "Ufahamu wa maneno"],
        sample_activities=["Kusoma sentensi fupi kwa pamoja", "Kuoanisha sentensi na picha"],
        assessment_criteria="Anasoma maneno 4/5 kwa usahihi, lakini anapata ugumu kwenye aya."
    ),
    "Paragraph": LevelCurriculum(
        level_name="Paragraph",
        language="swahili",
        objectives=["Kusoma aya fupi ya Kiswahili (mistari 4) na kuelewa maana."],
        skills=["Ufasaha wa kusoma aya", "Ufahamu wa msingi"],
        sample_activities=["Kusoma aya kwa sauti", "Kujibu maswali mepesi kuhusu aya"],
        assessment_criteria="Anasoma aya ya mistari 4 kwa ufasaha na makosa 1 au chini."
    ),
    "Story": LevelCurriculum(
        level_name="Story",
        language="swahili",
        objectives=["Kusoma hadithi ya Kiswahili kwa ufasaha na kujibu maswali ya ufahamu."],
        skills=["Ufahamu wa hadithi", "Uchambuzi wa maana"],
        sample_activities=["Kueleza muhtasari wa hadithi", "Kujibu maswali ya ufahamu ya hadithi"],
        assessment_criteria="Anasoma hadithi ya mistari 7-10 kwa ufasaha na kujibu maswali."
    )
}

NUMERACY_CURRICULUM: Dict[str, LevelCurriculum] = {
    "Beginner": LevelCurriculum(
        level_name="Beginner",
        objectives=["Recognize single-digit numbers 1 to 9."],
        skills=["Number identification", "Counting physical objects"],
        sample_activities=["Count bundles of sticks", "Match number cards to concrete objects"],
        assessment_criteria="Identifies fewer than 4/5 single-digit numbers."
    ),
    "1-Digit Number": LevelCurriculum(
        level_name="1-Digit Number",
        objectives=["Recognize two-digit numbers 10 to 99."],
        skills=["Place value awareness", "Counting up to 99"],
        sample_activities=["Bundle sticks into tens and ones", "Flashcard matching for 10-99"],
        assessment_criteria="Identifies single digits, but fewer than 4/5 two-digit numbers."
    ),
    "2-Digit Number": LevelCurriculum(
        level_name="2-Digit Number",
        objectives=["Solve addition problems with 1-digit and 2-digit numbers."],
        skills=["Addition concept", "Combining groups"],
        sample_activities=["Vertical addition exercises", "Addition with concrete bundles"],
        assessment_criteria="Recognizes two-digit numbers, but cannot perform addition."
    ),
    "Addition": LevelCurriculum(
        level_name="Addition",
        objectives=["Solve subtraction problems with/without borrowing."],
        skills=["Subtraction concept", "Takeaway operations"],
        sample_activities=["Subtraction games using bundles", "Word problems involving takeaway"],
        assessment_criteria="Solves addition correctly, but fails subtraction."
    ),
    "Subtraction": LevelCurriculum(
        level_name="Subtraction",
        objectives=["Solve basic multiplication problems."],
        skills=["Repeated addition", "Times tables"],
        sample_activities=["Grouping objects into equal rows", "Multiplication grid practice"],
        assessment_criteria="Solves subtraction correctly, but fails multiplication."
    ),
    "Multiplication": LevelCurriculum(
        level_name="Multiplication",
        objectives=["Solve basic division problems."],
        skills=["Equal sharing", "Division operations"],
        sample_activities=["Sharing objects equally into groups", "Simple division exercises"],
        assessment_criteria="Solves multiplication correctly, but fails division."
    ),
    "Division": LevelCurriculum(
        level_name="Division",
        objectives=["Master advanced arithmetic operations and multi-step word problems."],
        skills=["Applied arithmetic", "Multi-step problem solving"],
        sample_activities=["Real-world story problems", "Peer math games"],
        assessment_criteria="Solves division problems correctly."
    )
}

def get_level_curriculum(domain: str, level: str, language: str = "english") -> LevelCurriculum:
    domain_clean = domain.lower()
    lang_clean = language.lower()

    if domain_clean == "literacy":
        if lang_clean in ["swahili", "kiswahili"]:
            return SWAHILI_LITERACY_CURRICULUM.get(level, SWAHILI_LITERACY_CURRICULUM["Beginner"])
        else:
            return ENGLISH_LITERACY_CURRICULUM.get(level, ENGLISH_LITERACY_CURRICULUM["Beginner"])
    elif domain_clean == "numeracy":
        return NUMERACY_CURRICULUM.get(level, NUMERACY_CURRICULUM["Beginner"])
    else:
        raise ValueError(f"Unknown domain: {domain}")
