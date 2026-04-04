// --- CONSTANTS ---
const THEME_COLORS = {
    hsk21: "#d1f2eb",
    hsk22: "#f9e79f",
    hsk23: "#fadbd8",
    hsk24: "#d4efdf",
    hsk25: "#ebdef0",
    hsk26: "#f5cba7",
    hsk31: "#ffff00", 
    hsk32: "#ffa500", 
    hsk33: "#e0e0e0", 
    hsk34: "#ffc0cb", 
    hsk35: "#90ee90", 
    hsk36: "#add8e6", 
    hsk37: "#bdb76b", 
    searchHighlight: "#ff7675"
};

$(document).ready(function() {
    // 1. Inject HSK Styles using constants
    let hskStyles = "";
    Object.keys(THEME_COLORS).forEach(key => {
        if(key.startsWith('hsk')) {
            hskStyles += `.${key} { background-color: ${THEME_COLORS[key]} !important; }\n`;
        }
    });
    $("<style>").text(hskStyles).appendTo("head");




// --- GLOBAL SMART TOOLTIP LOGIC ---
    
    // 1. Create the tooltip box and attach it directly to the <body>
    $("body").append('<div id="global-tooltip"></div>');

    // 2. Listen for the mouse entering any word with the tooltip class
    $(document).on("mouseenter", ".hsk-tooltip", function() {
        const text = $(this).attr("data-tooltip");
        if (!text) return; 

        const rect = this.getBoundingClientRect(); 
        const $tooltip = $("#global-tooltip");

        // Insert text and temporarily make it visible so we can measure its actual size
        $tooltip.text(text).css("display", "block");

        // Grab dimensions
        const tooltipWidth = $tooltip.outerWidth();
        const tooltipHeight = $tooltip.outerHeight();
        const windowWidth = $(window).width();
        
        // --- Calculate "Ideal" Position (Centered, Above the word) ---
        let finalLeft = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        let finalTop = rect.top - tooltipHeight - 10; 

        // --- Smart Boundary Adjustments ---
        // Left Edge
        if (finalLeft < 10) {
            finalLeft = 10; 
        } 
        // Right Edge
        else if ((finalLeft + tooltipWidth) > (windowWidth - 10)) {
            finalLeft = windowWidth - tooltipWidth - 10; 
        }
		
        // Top Edge (If it bleeds off the top of the screen)
		let isFlipped = false;
        if (finalTop < 10) {
            finalTop = rect.bottom + 10; // Flip to below the word
			isFlipped = true;
        }

        // --- CALCULATE ARROW POSITION ---
        // Find the absolute center of the hovered word, then subtract the tooltip's left edge
        // This ensures the arrow ALWAYS points exactly at the word, even if the tooltip shifted!
        let arrowPositionX = (rect.left + (rect.width / 2)) - finalLeft;

        // Apply the flip class if needed
        if (isFlipped) {
            $tooltip.addClass("flip-up");
        } else {
            $tooltip.removeClass("flip-up");
        }

        // Apply the final, safe coordinates AND the custom arrow position
        $tooltip.css({
            left: finalLeft,
            top: finalTop,
            '--arrow-x': arrowPositionX + 'px' // Feeds the math directly into the CSS!
        });
        
    // 3. Listen for the mouse leaving the word
    }).on("mouseleave", ".hsk-tooltip", function() {
        // Hide the tooltip instantly
        $("#global-tooltip").css("display", "none");
    });

// --- END: GLOBAL SMART TOOLTIP LOGIC ---








	// 2. Instant Pinyin Search highlighting
    $("#pinyinSearchBox").on("input", function() {
        const query = $(this).val().toLowerCase().trim();
        
        // Remove highlight from ALL words (both main text and vocab list)
        $(".hsk-word").removeClass("search-match");
        $(".vocab-word").removeClass("search-match"); // <--- Added: Clear vocab highlights
        $("#matchesFoundOutput").text(""); // Clear previous feedback

        if (query.length > 0) {
            let matchCount = 0;
            
            // --- SEARCH MAIN TEXT ---
            // Iterate over every generated word in the main text
            $(".hsk-word").each(function() {
                const wordPinyin = $(this).attr("data-pinyin") || "";
                
                // If the pinyin attribute includes the typed query, highlight it
                if (wordPinyin.includes(query)) {
                    $(this).addClass("search-match");
                    matchCount++;
                }
            });

            // --- SEARCH VOCAB LIST ---
            // Iterate over every generated definition in the vocab pane
            $(".vocab-word").each(function() {
                const vocabPinyin = $(this).attr("data-pinyin") || "";
                
                // If the pinyin matches, add the highlight class to the definition line
                if (vocabPinyin.includes(query)) {
                    $(this).addClass("search-match");
                }
            });
            
            // Provide feedback in the sidebar
            if(matchCount > 0) {
                 $("#userChoiceConsoleOutput").text(`Matches found: ${matchCount}`).css("color", "green");
            } else {
                 $("#userChoiceConsoleOutput").text("Matches found: 0").css("color", "#d63031");
            }
        } else {
             $("#userChoiceConsoleOutput").text(""); // Clear message if box is empty
        }
    });

    // Prevent 'Enter' key from reloading the page
    $("#formForPinyinSearchBox").on("submit", function(e) {
        e.preventDefault();
    });
	
	// --- COLUMN RESIZER LOGIC ---
    const resizer = document.getElementById('dragMe');
    const leftPane = document.getElementById('text-pane');
    const mainContent = document.getElementById('main-content');
    let isResizing = false;

    resizer.addEventListener('mousedown', function(e) {
        isResizing = true;
        resizer.classList.add('resizing');
        // Prevent text selection while dragging
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        
        // Calculate new width for left pane based on mouse position relative to the main container
        let mainRect = mainContent.getBoundingClientRect();
        let newWidth = e.clientX - mainRect.left;
        
        // Keep the drag within reasonable boundaries so a column doesn't disappear
        if (newWidth > 250 && newWidth < mainRect.width - 250) {
            leftPane.style.width = newWidth + 'px';
            leftPane.style.flex = 'none'; // Lock the width in place
        }
    });

    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('resizing');
            // Restore normal cursor and text selection
            document.body.style.cursor = 'default';
            document.body.style.userSelect = '';
        }
    });
});