export type BootPhase = 'bios' | 'bootloader' | 'kernel' | 'init' | 'login' | 'complete';
export type MessageType = 'ok' | 'warn' | 'error' | 'info' | 'plain';

export interface BootMessage {
  text: string;
  type: MessageType;
  delay: number;
}

const randomDelay = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

// BIOS Phase Messages
export const biosMessages: BootMessage[] = [
  { text: 'Phoenix BIOS v6.00PG', type: 'plain', delay: 0 },
  { text: 'Copyright 1985-2024, Phoenix Technologies Ltd.', type: 'plain', delay: 100 },
  { text: '', type: 'plain', delay: 50 },
  { text: 'CPU: AMD Ryzen 9 7950X 16-Core Processor', type: 'plain', delay: 80 },
  { text: 'Speed: 4.50 GHz', type: 'plain', delay: 60 },
  { text: '', type: 'plain', delay: 50 },
  { text: 'Memory Test: 32768M OK', type: 'plain', delay: 200 },
  { text: '', type: 'plain', delay: 50 },
  { text: 'Detecting IDE Drives...', type: 'plain', delay: 150 },
  { text: '  Primary Master  : SSD 1TB', type: 'plain', delay: 100 },
  { text: '  Primary Slave   : None', type: 'plain', delay: 100 },
  { text: '', type: 'plain', delay: 100 },
];

// Bootloader Phase Messages
export const bootloaderMessages: BootMessage[] = [
  { text: 'GRUB loading.', type: 'plain', delay: 300 },
  { text: 'Welcome to GRUB!', type: 'plain', delay: 200 },
  { text: '', type: 'plain', delay: 100 },
  { text: 'GNU GRUB version 2.06', type: 'plain', delay: 150 },
  { text: '', type: 'plain', delay: 50 },
  { text: '┌─────────────────────────────────────────────┐', type: 'plain', delay: 50 },
  { text: '│ Portfolio OS (Default)                      │', type: 'plain', delay: 50 },
  { text: '│ Portfolio OS (Recovery mode)                │', type: 'plain', delay: 50 },
  { text: '│ Memory test (memtest86+)                    │', type: 'plain', delay: 50 },
  { text: '└─────────────────────────────────────────────┘', type: 'plain', delay: 50 },
  { text: '', type: 'plain', delay: 300 },
  { text: 'Loading Linux kernel...', type: 'plain', delay: 200 },
  { text: 'Loading initial ramdisk...', type: 'plain', delay: 200 },
  { text: '', type: 'plain', delay: 100 },
];

// Kernel Phase Messages
export const kernelMessages: BootMessage[] = [
  { text: '[    0.000000] Linux version 6.9.0-portfolio (builder@localhost)', type: 'plain', delay: 80 },
  { text: '[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz root=/dev/sda1 ro quiet splash', type: 'plain', delay: 60 },
  { text: '[    0.000000] Kernel command line: BOOT_IMAGE=/boot/vmlinuz root=/dev/sda1', type: 'plain', delay: 60 },
  { text: '[    0.028347] Memory: 32768M available', type: 'plain', delay: 70 },
  { text: '[    0.084521] CPU0: AMD Ryzen 9 7950X 16-Core Processor', type: 'plain', delay: 60 },
  { text: '[    0.156789] ACPI: Core revision 20240322', type: 'plain', delay: 50 },
  { text: '[    0.234567] PCI: Using configuration type 1 for base access', type: 'plain', delay: 60 },
  { text: '[    0.345678] Random: fast init done', type: 'plain', delay: 70 },
  { text: '[    0.456789] NET: Registered protocol family 16', type: 'plain', delay: 60 },
  { text: '[    0.567890] Block layer SCSI generic (bsg) driver version 0.4', type: 'plain', delay: 50 },
  { text: '[    0.678901] SCSI subsystem initialized', type: 'plain', delay: 60 },
  { text: '[    0.789012] PCI: Probing PCI hardware', type: 'plain', delay: 80 },
  { text: '[    0.890123] NET: Registered protocol family 2', type: 'plain', delay: 60 },
  { text: '[    1.001234] TCP established hash table entries: 524288', type: 'plain', delay: 70 },
  { text: '[    1.112345] Freeing unused kernel memory: 2048K', type: 'plain', delay: 80 },
  { text: '[    1.223456] Write protecting the kernel read-only data: 20480k', type: 'plain', delay: 60 },
];

// Init Phase Messages with fun easter eggs
const funnyMessages = [
  '[WARN] Coffee level critically low',
  '[WARN] Motivation.service: unstable',
  '[INFO] Procrastination.service: running perfectly',
  '[WARN] Sleep.service: not found',
  '[INFO] Creativity.service: level over 9000',
];

export const initMessages: BootMessage[] = [
  { text: '[  OK  ] Reached target Local File Systems.', type: 'ok', delay: 100 },
  { text: '         Starting Create Volatile Files and Directories...', type: 'info', delay: 80 },
  { text: '[  OK  ] Started Create Volatile Files and Directories.', type: 'ok', delay: 120 },
  { text: '         Starting Network Time Synchronization...', type: 'info', delay: 90 },
  { text: '[  OK  ] Started Network Time Synchronization.', type: 'ok', delay: 110 },
  { text: '         Starting Update UTMP about System Boot...', type: 'info', delay: 70 },
  { text: '[  OK  ] Started Update UTMP about System Boot.', type: 'ok', delay: 100 },
  { text: `         ${funnyMessages[Math.floor(Math.random() * funnyMessages.length)]}`, type: 'warn', delay: 150 },
  { text: '         Starting Network Manager...', type: 'info', delay: 80 },
  { text: '[  OK  ] Started Network Manager.', type: 'ok', delay: 120 },
  { text: '         Starting User Manager for UID 1000...', type: 'info', delay: 90 },
  { text: '[  OK  ] Started User Manager for UID 1000.', type: 'ok', delay: 100 },
  { text: '[  OK  ] Reached target Multi-User System.', type: 'ok', delay: 110 },
  { text: '         Starting Portfolio Website v1.0.0...', type: 'info', delay: 200 },
  { text: '[  OK  ] Started Portfolio Website.', type: 'ok', delay: 150 },
  { text: '[  OK  ] Reached target Graphical Interface.', type: 'ok', delay: 120 },
  { text: '', type: 'plain', delay: 100 },
];

// Login Phase Messages
export const loginMessages: BootMessage[] = [
  { text: '', type: 'plain', delay: 200 },
  { text: 'Portfolio OS 24.04 LTS tty1', type: 'plain', delay: 100 },
  { text: '', type: 'plain', delay: 50 },
];

export const getWelcomeMessage = () => {
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Hello';
  
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 18) greeting = 'Good afternoon';
  else if (hour >= 18 && hour < 22) greeting = 'Good evening';
  else greeting = 'Burning the midnight oil';
  
  return `${greeting}, welcome to Portfolio OS`;
};

// Easter egg responses
export const easterEggResponses = {
  whoami: [
    'guest',
    '',
    'Just a curious visitor exploring an interactive portfolio.',
    'Try typing "help" to see what else you can do!',
    '',
  ],
  help: [
    'Available commands:',
    '  whoami   - Display current user information',
    '  ls       - List directory contents',
    '  matrix   - Enter the Matrix',
    '  help     - Display this help message',
    '  neofetch - System information',
    '',
    'Press ESC or Ctrl+C to skip boot sequence',
    '',
  ],
  ls: [
    'total 42',
    'drwxr-xr-x  5 guest guest 4096 Dec 19 2025 Projects/',
    'drwxr-xr-x  3 guest guest 4096 Dec 19 2025 About/',
    'drwxr-xr-x  2 guest guest 4096 Dec 19 2025 Contact/',
    '-rw-r--r--  1 guest guest  404 Dec 19 2025 bugs.txt',
    '-rw-r--r--  1 guest guest 1337 Dec 19 2025 ideas.md',
    '-rwxr-xr-x  1 guest guest 9001 Dec 19 2025 creativity.exe',
    '-rw-r--r--  1 guest guest    0 Dec 19 2025 motivation.txt',
    '',
  ],
  neofetch: [
    '          ___           guest@portfolio-os',
    '         (.. |          ------------------',
    '         (<> |          OS: Portfolio Linux 24.04 LTS',
    '        / __  \\         Host: WebBrowser',
    '       ( /  \\ /|        Kernel: 6.9.0-creative',
    '      _/\\ __)\\_)_       Uptime: just booted',
    '      \\/-____\\/         Shell: interactive-zsh',
    '                        Resolution: your screen',
    '                        Theme: retro-terminal',
    '                        Terminal: TTY1',
    '                        CPU: Your device',
    '',
  ],
};

export const getCommandNotFoundMessage = (cmd: string) => [
  `bash: ${cmd}: command not found`,
  '',
  'Type "help" for available commands',
  '',
];




