<?php
/**
 * PanelPulse — Screenplay & Comic Script Parser
 * Converts structured script text into individual panel prompts & speech overlays.
 */

declare(strict_types=1);

class ScriptParser {

    private static array $stylePrompts = [
        'tactile-neo-comic' => 'tactile neo-comic art style, thick black ink contour outlines, risograph grain, halftone dot texture, claymorphic lighting, vibrant color grading, graphic novel aesthetic, 8k masterpiece',
        '90s-anime'         => 'vintage 1990s retro anime comic style, hand-drawn cel shading, nostalgic color palette, cinematic anime screencap, film grain, highly detailed line art',
        'noir-ink'          => 'dramatic noir ink graphic novel style, high contrast black and white, deep heavy shadows, chiaroscuro rim lighting, moody alley atmosphere, stark ink hatching',
        'watercolor'        => 'expressive loose watercolor wash illustration, organic ink linework, soft bleeding color washes, fluid artistic comic page, textured paper aesthetic',
        'chibi'             => 'cute kawaii chibi anime comic style, big expressive eyes, exaggerated head proportions, playful colorful palette, clean bold vector outlines',
    ];

    /**
     * Parse raw script text into an array of structured panel objects.
     */
    public static function parse(string $rawScript, string $artStyle = 'tactile-neo-comic', int $maxPanels = 6): array {
        $rawScript = trim($rawScript);
        if (empty($rawScript)) {
            return [];
        }

        $styleSuffix = self::$stylePrompts[$artStyle] ?? self::$stylePrompts['tactile-neo-comic'];
        $panels = [];

        // Split by "PANEL X:" or "PANEL [X]:" or double newlines if no panel tags found
        $panelBlocks = preg_split('/(?=PANEL\s*\d+:?)/i', $rawScript, -1, PREG_SPLIT_NO_EMPTY);

        // If no explicit PANEL tags, divide by double newlines into up to $maxPanels
        if (count($panelBlocks) <= 1 && !preg_match('/PANEL\s*\d+/i', $rawScript)) {
            $paragraphs = array_filter(array_map('trim', explode("\n\n", $rawScript)));
            $panelBlocks = array_slice($paragraphs, 0, $maxPanels);
        }

        $panelIndex = 1;
        foreach ($panelBlocks as $block) {
            $block = trim($block);
            if (empty($block)) continue;

            $panelData = self::parseSingleBlock($block, $panelIndex, $styleSuffix);
            $panels[] = $panelData;
            $panelIndex++;
            if ($panelIndex > $maxPanels) break;
        }

        return $panels;
    }

    /**
     * Parse an individual panel block extracting description, dialogue, and sound effects.
     */
    private static function parseSingleBlock(string $block, int $index, string $styleSuffix): array {
        $lines = explode("\n", $block);
        $sceneDescriptions = [];
        $dialogues = [];
        $sfxList = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            // Strip "PANEL X:" prefix if present
            if (preg_match('/^PANEL\s*\d+[:\s-]*(.*)$/i', $line, $m)) {
                if (!empty(trim($m[1]))) {
                    $sceneDescriptions[] = trim($m[1]);
                }
                continue;
            }

            // Detect Sound Effects: "SFX: BOOM!"
            if (preg_match('/^(?:SFX|SOUND\s*EFFECT)[:\s]+(.*)$/i', $line, $m)) {
                $sfxList[] = trim($m[1], " !.,:;");
                continue;
            }

            // Detect Character Dialogue: "NOVA: Dialogue text." or "NOVA (V.O.): Dialogue text."
            if (preg_match('/^([A-Z0-9_\-\s]+(?:\([A-Z0-9_\.\s]+\))?)[:\s]+(.*)$/u', $line, $m)) {
                $character = trim($m[1]);
                $speechText = trim($m[2], " \"'");
                if (!empty($character) && !empty($speechText)) {
                    $isVoiceOver = stripos($character, '(V.O.)') !== false;
                    $cleanChar = trim(preg_replace('/\(.*?\)/', '', $character));

                    $dialogues[] = [
                        'speaker'   => $cleanChar,
                        'text'      => $speechText,
                        'is_vo'     => $isVoiceOver,
                        'bubble_type' => $isVoiceOver ? 'caption' : 'speech',
                    ];
                    continue;
                }
            }

            // Default: Scene visual description
            $sceneDescriptions[] = $line;
        }

        $visualSummary = implode('. ', $sceneDescriptions);
        if (empty($visualSummary)) {
            $visualSummary = "Comic scene panel {$index} with dynamic comic composition";
        }

        // Build the AI Diffusion prompt
        $aiPrompt = trim($visualSummary) . ", " . $styleSuffix . ", masterpiece quality, vibrant colors";

        return [
            'panel_number' => $index,
            'description'  => $visualSummary,
            'ai_prompt'    => $aiPrompt,
            'dialogue'     => $dialogues,
            'sfx'          => $sfxList,
        ];
    }
}
