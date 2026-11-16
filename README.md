# Pomodoro Focus Timer

A polished, browser-based Pomodoro timer built with **HTML5, CSS3, and Vanilla JavaScript**. It helps users structure focused work sessions and restorative breaks through a minimal timer interface, animated progress ring, session tracking, motivational quotes, and optional sound and browser-notification support.

The project combines a functional time-management tool with a carefully styled interface featuring glassmorphism, animated particles, mode-specific accent colors, and responsive layouts.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Pomodoro Technique](#pomodoro-technique)
- [Timer Modes and Defaults](#timer-modes-and-defaults)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Using the Timer](#using-the-timer)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Session Tracking](#session-tracking)
- [Sound and Notifications](#sound-and-notifications)
- [Visual Design](#visual-design)
- [Responsive Design](#responsive-design)
- [Browser Storage and Settings](#browser-storage-and-settings)
- [Customization](#customization)
- [Deployment](#deployment)
- [Current Scope and Limitations](#current-scope-and-limitations)
- [Troubleshooting](#troubleshooting)
- [Potential Improvements](#potential-improvements)
- [License](#license)
- [Author](#author)

---

## Overview

This application is a single-page Pomodoro timer designed to make focused work sessions easy to start and manage.

Users can switch between three timer modes:

- **Focus:** a 25-minute work session.
- **Short Break:** a 5-minute rest.
- **Long Break:** a 15-minute rest.

The timer includes a circular SVG progress indicator, start/pause and reset controls, a completed-session counter, and four progress dots by default. Once a focus session finishes, the application records the completed session and selects a short or long break according to the configured cycle. When a break finishes, it returns to Focus mode.

The application runs entirely in the browser. It does not require a backend, database, account, package installation, or build process.

### Project details

| Property | Details |
|---|---|
| Project name | Pomodoro Focus Timer |
| Repository | M-Taimoor-Mansha/build-a-pomodoro-timer |
| Application type | Browser-based productivity timer |
| Architecture | Static front-end application |
| HTML | HTML5 |
| Styling | CSS3 |
| Logic | Vanilla JavaScript (ES6+) |
| Default focus duration | 25 minutes |
| Default short break | 5 minutes |
| Default long break | 15 minutes |
| Default long-break cycle | Every 4 completed focus sessions |
| External JavaScript libraries | None |
| Backend | Not required |
| License | MIT |

---

## Features

### 1. Three timer modes

- **Focus:** intended for uninterrupted work.
- **Short Break:** intended for a brief rest between focus sessions.
- **Long Break:** intended for a longer rest after a completed focus cycle.

Each mode has its own duration and visual accent color.

### 2. Start, pause, and reset controls

- Start begins the countdown.
- Pause stops the countdown while preserving the remaining time.
- Start can be selected again to resume.
- Reset stops the timer and restores the selected mode's full duration.

The primary button changes its label and icon between START and PAUSE.

### 3. Animated circular progress ring

The timer is presented inside a circular SVG progress indicator. It includes a background track, dynamic progress arc, rounded progress endpoints, decorative outer ring, sixty tick marks, inner glow effect, and accent-colored glow.

The progress arc updates as the remaining time changes.

### 4. Automatic session transitions

When a Focus timer reaches zero:

1. The timer stops.
2. The completed-focus-session counter increases.
3. The session progress dots update.
4. The application determines the next break.
5. A long break is selected after each fourth completed focus session, otherwise a short break is selected.

When a break finishes, the application switches back to Focus mode.

**Note:** The next mode is selected automatically, but its timer does not automatically start. The user starts the next session manually.

### 5. Completed-session counter

The interface displays the number of completed focus sessions.

Four progress dots are displayed by default. Each completed focus session fills the next dot. After the fourth session, the cycle starts again.

The numeric completed-session count continues increasing beyond the first four sessions.

### 6. Motivational quotes

The application includes a collection of motivational quotes.

- A quote is displayed above the timer card.
- Quotes rotate when the timer mode changes.
- The previous quote fades out.
- The next quote fades in.
- Some quotes include author attribution.

### 7. Animated particle background

A canvas-based background animation adds subtle movement behind the timer. It includes floating particles, particle movement, connecting lines between nearby particles, dynamic particle colors based on the active timer mode, and canvas resizing when the browser viewport changes.

The animation uses the browser's requestAnimationFrame API.

### 8. Mode-specific color themes

| Mode | Accent theme |
|---|---|
| Focus | Coral / Rose |
| Short Break | Teal / Cyan |
| Long Break | Lavender / Indigo |

The theme is controlled through CSS custom properties and mode classes on the document body.

### 9. Sound feedback

The application includes an optional sound setting in its internal settings object.

When enabled, the timer completion handler generates a short three-note chime using the browser's native Web Audio API. No external audio files or sound libraries are required.

The default sound setting is enabled.

### 10. Browser notifications

The application includes optional notification logic using the browser Notifications API.

When notifications are enabled in the internal settings and the browser has granted notification permission, the application can display a completion notification.

The default notification setting is disabled.

### 11. Keyboard shortcuts

- Space: Start or pause.
- R: Reset.

The shortcuts are ignored when the focused element is an input or textarea.

### 12. Responsive interface

The timer layout adapts to smaller screens through CSS media queries. The timer ring, typography, buttons, and spacing adjust to provide a usable interface on mobile devices and larger displays.

---

## Pomodoro Technique

The Pomodoro Technique is a time-management approach that divides work into focused intervals separated by short breaks.

A common cycle is:

1. Choose a task.
2. Work with focus for 25 minutes.
3. Take a 5-minute short break.
4. Repeat the focus and short-break cycle.
5. After four completed focus sessions, take a longer break.
6. Begin another cycle.

This application uses the following default cycle:

~~~text
Focus (25 min)
      |
Short Break (5 min)
      |
Focus (25 min)
      |
Short Break (5 min)
      |
Focus (25 min)
      |
Short Break (5 min)
      |
Focus (25 min)
      |
Long Break (15 min)
      |
Repeat
~~~

---

## Timer Modes and Defaults

The default settings are defined in script.js:

~~~javascript
const DEFAULT_SETTINGS = {
  durations: { focus: 25, short: 5, long: 15, cycle: 4 },
  sound: true,
  notif: false,
};
~~~

| Setting | Default | Description |
|---|---:|---|
| Focus duration | 25 minutes | Main work session |
| Short break | 5 minutes | Short rest |
| Long break | 15 minutes | Extended rest |
| Cycle | 4 sessions | Focus sessions before a long break |
| Sound | Enabled | Plays a completion chime |
| Notifications | Disabled | Browser notifications |

These values are the application's defaults. There is currently no visible settings panel for changing them in the interface.

---

## How It Works

### Application initialization

The application is wrapped in an initialization function in script.js. It waits for the DOM to be ready before accessing page elements and initializing the timer.

During initialization it:

1. Loads settings from browser localStorage, falling back to defaults.
2. Prepares the initial Focus timer.
3. Retrieves the required DOM elements.
4. Calculates the SVG progress-ring circumference.
5. Generates the decorative tick marks.
6. Initializes the animated particle background.
7. Registers timer controls and keyboard shortcuts.
8. Builds the session progress dots.
9. Renders the initial timer display.

### Countdown logic

The timer uses JavaScript's setInterval to update the remaining seconds once per second.

The remaining time is converted into minutes and seconds and displayed in MM:SS format.

The SVG progress arc is updated using the ratio of remaining time to total session time.

### Timer state

The application maintains internal state for the current timer mode, remaining time, total duration, running or paused status, active interval identifier, completed focus-session count, audio context, and loaded settings.

### Mode switching

Selecting a mode tab changes the active mode, loads the corresponding duration, pauses any running timer, updates the timer display, updates the active mode tab, applies the mode-specific body class, updates the mode label, and rotates the motivational quote.

### Progress-ring calculation

The circular SVG ring uses a radius of 82 units by default.

~~~javascript
const circumference = 2 * Math.PI * radius;
const progress = timeLeft / totalTime;
const offset = circumference - progress * circumference;
~~~

This creates a visual representation of the countdown.

---

## Technology Stack

| Technology / API | Purpose |
|---|---|
| HTML5 | Application structure and semantic elements |
| CSS3 | Layout, themes, transitions, and animations |
| JavaScript ES6+ | Timer state, countdown, and interaction logic |
| SVG | Circular progress ring and interface icons |
| Canvas API | Animated particle background |
| Web Audio API | Generated completion chime |
| Notifications API | Optional browser notifications |
| localStorage | Loading saved application settings |
| requestAnimationFrame | Smooth background animation |
| Google Fonts | Inter and Space Mono typography |

### External resources

The application loads fonts from Google Fonts:

- Inter
- Space Mono

There are no external JavaScript libraries or CSS frameworks.

No npm installation or build tools are required.

---

## Project Structure

~~~text
build-a-pomodoro-timer/
│
├── index.html       # Application markup and interface
├── styles.css       # Visual design, themes, and responsive styling
├── script.js        # Timer logic, animations, audio, and interactions
├── LICENSE          # MIT License
└── README.md        # Project documentation
~~~

### File responsibilities

| File | Description |
|---|---|
| index.html | Defines the timer card, mode tabs, SVG progress ring, controls, session counter, quote, and footer. |
| styles.css | Contains design tokens, mode-specific themes, layout, glassmorphism, animations, and responsive breakpoints. |
| script.js | Implements timer state, countdown, mode switching, session tracking, particle animation, sound, notifications, and keyboard shortcuts. |
| LICENSE | Contains the MIT License. |
| README.md | Documents the application and its usage. |

---

## Getting Started

### Requirements

- A modern web browser.
- An internet connection for Google Fonts.
- Git (optional, for cloning the repository).
- A code editor such as Visual Studio Code (optional).

There is no package manager, build process, backend, or database setup.

### 1. Clone the repository

~~~bash
git clone https://github.com/M-Taimoor-Mansha/build-a-pomodoro-timer.git
~~~

### 2. Open the project folder

~~~bash
cd build-a-pomodoro-timer
~~~

### 3. Run the application

**Option A: Open directly**

Open index.html in a modern web browser.

**Option B: Visual Studio Code Live Server**

1. Open the project folder in Visual Studio Code.
2. Install the Live Server extension if necessary.
3. Right-click index.html.
4. Select **Open with Live Server**.

**Option C: Python local server**

Run:

~~~bash
python -m http.server 5500
~~~

Then visit:

~~~text
http://localhost:5500
~~~

---

## Using the Timer

### Start a focus session

1. Open the application.
2. Select the Focus tab if it is not already active.
3. Select START.
4. The countdown begins and the progress ring updates.

### Pause and resume

- Select PAUSE to stop the countdown.
- Select START again to resume from the remaining time.

### Reset the timer

Select the reset button to restore the currently selected mode to its full duration.

### Switch modes

Select one of the three tabs: Focus, Short Break, or Long Break.

Switching modes resets the selected mode's countdown and pauses any active timer.

### Complete a session

When a Focus timer reaches zero, the completed-session count increases and the next break mode is selected.

When a break finishes, the application returns to Focus mode.

The next session remains paused until START is selected.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| Space | Start or pause the timer |
| R | Reset the current timer |

Keyboard shortcuts are ignored while typing in input and textarea elements.

---

## Session Tracking

The session counter records completed Focus sessions during the current page session.

For example:

| Completed focus sessions | Progress dots |
|---:|---|
| 0 | ○ ○ ○ ○ |
| 1 | ● ○ ○ ○ |
| 2 | ● ● ○ ○ |
| 3 | ● ● ● ○ |
| 4 | ○ ○ ○ ○ |

The dots represent progress within the current four-session cycle. The numerical session counter continues increasing.

**Important:** The completed-session count is held in JavaScript memory. It is not currently saved to localStorage, so refreshing or reopening the page resets the count.

---

## Sound and Notifications

### Completion sound

The application uses the native Web Audio API to generate a three-note chime. The notes are generated with sine-wave oscillators and gain envelopes. No audio file is downloaded.

The internal default setting is sound enabled.

### Browser notifications

The notification implementation uses the browser's native Notifications API.

The internal default is notifications disabled. If notification support is enabled in the settings object, the browser must also grant notification permission before notifications can be displayed.

The current interface does not provide a visible sound or notification settings panel.

---

## Visual Design

The application uses a premium dark interface with translucent surfaces and mode-specific accent colors.

### Background palette

| Token | Value | Usage |
|---|---|---|
| Deep background | #0c0e1a | Main page background |
| Mid background | #131627 | Supporting background tones |
| Card background | rgba(19, 22, 39, 0.65) | Translucent timer card |
| Primary text | #f0f0f5 | Main interface text |
| Secondary text | rgba(240, 240, 245, 0.5) | Supporting text |
| Muted text | rgba(240, 240, 245, 0.3) | Secondary labels |

### Mode accent colors

| Mode | Hue | Theme |
|---|---:|---|
| Focus | 355° | Coral / Rose |
| Short Break | 174° | Teal / Cyan |
| Long Break | 258° | Lavender / Indigo |

### Typography

- **Inter:** interface text, buttons, labels, and supporting content.
- **Space Mono:** timer digits.

### Interface characteristics

- Glassmorphism timer card.
- Blurred translucent background.
- Circular animated progress indicator.
- Accent-colored glow effects.
- Floating background particles.
- Animated mode transitions.
- Rounded buttons and controls.
- Subtle hover and active states.
- Responsive spacing and typography.

---

## Responsive Design

The stylesheet includes responsive breakpoints for different viewport sizes.

| Breakpoint | Behavior |
|---|---|
| Below 480px | Smaller timer ring, compact card padding, reduced typography, and simplified mode-tab icons |
| 480px to 767px | Base layout and timer dimensions |
| 768px and above | Larger timer ring and timer digits |

The main application wrapper has a maximum width of 420px and is centered within the viewport.

The canvas background automatically resizes when the browser window changes dimensions.

---

## Browser Storage and Settings

The script loads settings from localStorage using the key:

~~~text
pomo_settings
~~~

The settings loader attempts to parse the saved JSON value. If the value is missing or invalid, the application uses its default settings.

The application merges saved duration values with the default duration configuration so missing duration properties can fall back to their defaults.

Example settings structure:

~~~json
{
  "durations": {
    "focus": 25,
    "short": 5,
    "long": 15,
    "cycle": 4
  },
  "sound": true,
  "notif": false
}
~~~

**Current limitation:** The application reads this settings object but does not currently provide a settings interface or save changes through user controls. The completed-session count and current timer state are also not persisted.

---

## Customization

### Change timer durations

Open script.js and find the DEFAULT_SETTINGS object.

For example, to use a 30-minute focus session:

~~~javascript
const DEFAULT_SETTINGS = {
  durations: {
    focus: 30,
    short: 5,
    long: 15,
    cycle: 4
  },
  sound: true,
  notif: false,
};
~~~

The application uses the configured values when initializing and switching timer modes.

### Change the long-break frequency

Change the cycle value. For example, setting it to 3 selects a long break after every three completed focus sessions.

### Change the accent colors

Open styles.css and locate the design tokens near the beginning.

Focus theme:

~~~css
:root {
  --accent-h: 355;
  --accent-s: 85%;
  --accent-l: 62%;
}
~~~

Short-break theme:

~~~css
.mode-short-break {
  --accent-h: 174;
  --accent-s: 72%;
  --accent-l: 56%;
}
~~~

Long-break theme:

~~~css
.mode-long-break {
  --accent-h: 258;
  --accent-s: 68%;
  --accent-l: 65%;
}
~~~

### Change motivational quotes

Open script.js and locate the quotes array. Add, remove, or edit quote strings in that array.

### Change typography

The font resources are declared in the head of index.html. The corresponding font families are referenced in styles.css. Update both locations if replacing Inter or Space Mono.

### Change the timer card appearance

The timer card styles are defined by the .timer-card selector in styles.css. You can customize its background, border, blur, border radius, padding, and shadow.

---

## Deployment

The project is a static front-end application. It can be hosted using any platform that serves HTML, CSS, and JavaScript files.

### GitHub Pages

1. Open the repository on GitHub.
2. Navigate to **Settings**.
3. Select **Pages**.
4. Choose the main branch.
5. Select the repository root directory.
6. Save the configuration.
7. Wait for GitHub Pages to publish the application.

### Vercel

1. Sign in to Vercel.
2. Import the GitHub repository.
3. Set the project root directory to the repository root.
4. Leave the build command empty.
5. Deploy the static application.

### Netlify

1. Import the GitHub repository.
2. Set the publish directory to the repository root.
3. Leave the build command empty.
4. Deploy the application.

Make sure index.html, styles.css, and script.js are included in the published directory.

---

## Current Scope and Limitations

The project is a functional front-end timer, not a full productivity platform.

| Capability | Current status |
|---|---|
| Focus countdown | Implemented |
| Short-break countdown | Implemented |
| Long-break countdown | Implemented |
| Start and pause | Implemented |
| Reset | Implemented |
| Mode switching | Implemented |
| SVG progress ring | Implemented |
| Completed focus-session counter | Implemented, page-session only |
| Four-session progress dots | Implemented |
| Automatic next-mode selection | Implemented |
| Automatic start of next session | Not implemented |
| Motivational quote rotation | Implemented |
| Animated particle background | Implemented |
| Mode-specific accent themes | Implemented |
| Generated completion sound | Implemented, enabled by default |
| Browser notifications | Logic implemented, disabled by default |
| Visible settings panel | Not implemented |
| User-adjustable durations through UI | Not implemented |
| Persistent session history | Not implemented |
| Persistent timer state | Not implemented |
| Task management | Not implemented |
| User accounts | Not implemented |
| Backend or database | Not required |

### Timer accuracy note

The countdown uses setInterval with a one-second interval. Browser scheduling, inactive tabs, device sleep, and system load can affect timer precision. It is suitable as a lightweight productivity timer, but it is not a precision timing instrument.

---

## Troubleshooting

### The page loads without styling

Confirm that styles.css is in the same directory as index.html and that the stylesheet reference is correct.

### The timer does not start

- Confirm that script.js is present.
- Check the browser developer console for JavaScript errors.
- Confirm that the required timer elements exist in index.html.

### The progress ring does not move

Check that the SVG progress circle has the expected ID: progress-ring-circle.

### The completion sound is not playing

- Check that browser audio is not muted.
- Start the timer through a user interaction.
- Confirm that the internal sound setting is enabled.
- Check whether the browser supports the Web Audio API.

Some browsers restrict audio until the user interacts with the page.

### Browser notifications are not appearing

- Confirm that the browser supports the Notifications API.
- Confirm that notification permission has been granted.
- Confirm that the internal notif setting is enabled.
- Check browser and operating-system notification settings.

The current application does not expose a visible notification settings control.

### Fonts are not loading

The application loads Inter and Space Mono from Google Fonts. Check the internet connection or replace the external font resources with locally hosted fonts.

---

## Potential Improvements

The following features could expand the application in future versions.

### Timer and settings

- User-adjustable focus and break durations.
- A dedicated settings panel.
- Configurable long-break intervals.
- Auto-start options for subsequent sessions.
- More accurate timing based on elapsed timestamps.
- Customizable completion sounds.
- Notification permission controls.

### Productivity features

- Persistent session history.
- Daily and weekly focus statistics.
- Task lists and task selection.
- Focus goals.
- Session notes.
- Productivity charts.
- Streak tracking.

### User experience

- Light and dark themes.
- Accessibility improvements.
- Reduced-motion preference support.
- Better screen-reader announcements.
- Mobile-friendly controls.
- Optional fullscreen mode.
- Improved browser-tab title updates for every timer mode.

These are possible future enhancements, not features currently implemented.

---

## License

This project is licensed under the **MIT License**.

Copyright (c) 2026 CodewithTaimoor.

You may use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the software, subject to the conditions in the license.

See the [LICENSE](LICENSE) file for the complete license text.

---

## Author

**Muhammad Taimoor Mansha**

- GitHub: [@M-Taimoor-Mansha](https://github.com/M-Taimoor-Mansha)
- LinkedIn: [Muhammad Taimoor Mansha](https://linkedin.com/in/muhammad-taimoor-mansha-a09455228)
- Portfolio: [Personal Portfolio](https://m-taimoor-mansha.github.io/Portfolio/)

---

<p align="center">
  Built with HTML, CSS, and Vanilla JavaScript.
  <br>
  <strong>Stay focused. Stay productive. 🍅</strong>
</p>
