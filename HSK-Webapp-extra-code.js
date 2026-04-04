// Function to extract up to 3 sentences from the corpus
function getExamplesForTooltip(word, refsArray) {
    // If there are no references or it's not an array, return empty
    if (!refsArray || !Array.isArray(refsArray) || refsArray.length === 0) return "";
    
    let examples = [];
    let hasMore = false;


    // Loop through references like "4.2"
    for (let i = 0; i < refsArray.length; i++) {
        if (examples.length >= 5) { //@@@this is never executing!!!
            hasMore = true;
			console.log("hasMore is: ", hasMore);
            break;
        }
        
        let parts = refsArray[i];
        if (parts.length !== 4) {
			console.warn("parts.length: ", parts.length);
			continue;
		}
		
		let bookNum = parseInt(parts[0]);
        let chapNum = parseInt(parts[1]);
        let secNum = parseInt(parts[2]);
		
		//added by me (DN) to find book first
		let bookObj = hskCorpusTexts.find(book => book?.bookNumber === bookNum);
		if (!bookObj) continue;

        // Find the chapter and section in the corpus (assumes variable is hskCorpusTexts)
        let chapterObj = bookObj.chapters.find(c => c?.chapter === chapNum);
        if (!chapterObj) continue;

        let sectionObj = chapterObj.sections.find(s => s?.section === secNum);
        if (!sectionObj || !sectionObj.text) continue;

        // REGEX TRICK: Find characters that aren't punctuation/newlines, 
        // followed by the word, followed by non-punctuation, ending with optional punctuation.
        let regex = new RegExp(`[^。！？\\n]*${word}[^。！？\\n]*[。！？]?`, 'g');
        let matches = sectionObj.text.match(regex);
        
        if (matches) {
			
            for (let match of matches) {
                if (examples.length >= 5) {
                    hasMore = true;
                    break;
                }
                let cleanMatch = match.trim();
                if (cleanMatch) {
                    examples.push(`${refsArray[i]}: ${cleanMatch}`);
                }
            }
        }
    }

    if (examples.length === 0) return "";
    
    // Join with double line breaks for readability in the tooltip
    let resultText = examples.join("\n\n");
    if (hasMore) {
        resultText += "\n\n(更 多...)";
    }
	
    return resultText;
}