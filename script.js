class EnglishFortuneGame {
    constructor() {
        this.userProgress = this.loadProgress();
        this.initWheel();
        this.updateUI();
        this.initEventListeners();
    }

    loadProgress() {
        const saved = localStorage.getItem('englishGameProgress');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return {
            points: 0,
            level: 1,
            spins: 0,
            lessonsCompleted: 0,
            availableSpins: 1,
            badges: ['beginner'],
            completedLessons: [],
            currentStreak: 0
        };
    }

    saveProgress() {
        localStorage.setItem('englishGameProgress', JSON.stringify(this.userProgress));
    }

    initWheel() {
        const wheel = document.getElementById('fortuneWheel');
        wheel.innerHTML = '';
        
        const prizes = [
            { text: "10 Points", points: 10, color: "#ff6b6b" },
            { text: "25 Points", points: 25, color: "#4ecdc4" },
            { text: "Extra Spin", points: "spin", color: "#45b7d1" },
            { text: "JACKPOT 50!", points: 50, color: "#f9c74f" },
            { text: "15 Points", points: 15, color: "#90be6d" },
            { text: "Bonus Video", points: "video", color: "#577590" }
        ];

        prizes.forEach((prize, index) => {
            const section = document.createElement('div');
            section.className = 'wheel-section';
            section.style.transform = `rotate(${index * 60}deg)`;
            section.innerHTML = `
                <div style="transform: rotate(30deg); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                    ${prize.text}
                </div>
            `;
            section.dataset.prize = JSON.stringify(prize);
            wheel.appendChild(section);
        });
    }

    spinWheel() {
        if (this.userProgress.availableSpins < 1) {
            alert('Complete a lesson to earn a spin!');
            return;
        }

        const wheel = document.getElementById('fortuneWheel');
        const spinButton = document.getElementById('spinButton');
        
        spinButton.disabled = true;
        this.userProgress.availableSpins--;
        this.userProgress.spins++;
        
        const randomDegree = 1800 + Math.floor(Math.random() * 360);
        wheel.style.transform = `rotate(${randomDegree}deg)`;
        
        setTimeout(() => {
            const normalizedDegree = randomDegree % 360;
            const prizeIndex = Math.floor(normalizedDegree / 60);
            const prize = JSON.parse(wheel.children[prizeIndex].dataset.prize);
            this.awardPrize(prize);
            spinButton.disabled = false;
            this.updateUI();
            this.saveProgress();
        }, 4000);
    }

    awardPrize(prize) {
        let message = '';
        
        if (prize.points === "spin") {
            this.userProgress.availableSpins++;
            message = '🎉 Bonus! You won an extra spin!';
        } else if (prize.points === "video") {
            message = '🎉 Bonus! Special video lesson unlocked!';
        } else {
            this.userProgress.points += prize.points;
            message = `🎉 Congratulations! You won ${prize.points} points!`;
        }
        
        this.checkLevelUp();
        this.checkAchievements();
        this.showPrizeAnimation(message);
    }

    showPrizeAnimation(message) {
        const animation = document.createElement('div');
        animation.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 1.5rem;
            z-index: 1000;
            animation: popIn 0.5s ease-out;
        `;
        animation.innerHTML = message;
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 3000);
    }

    checkLevelUp() {
        const newLevel = Math.floor(this.userProgress.points / 100) + 1;
        if (newLevel > this.userProgress.level) {
            this.userProgress.level = newLevel;
            this.showPrizeAnimation(`🎊 LEVEL UP! You are now level ${newLevel}!`);
        }
    }

    checkAchievements() {
        const achievements = document.querySelectorAll('.badge');
        
        if (this.userProgress.lessonsCompleted >= 1) {
            achievements[0].classList.add('unlocked');
            achievements[0].classList.remove('locked');
        }
        
        if (this.userProgress.points >= 100) {
            achievements[1].classList.add('unlocked');
            achievements[1].classList.remove('locked');
        }
        
        if (this.userProgress.spins >= 10) {
            achievements[2].classList.add('unlocked');
            achievements[2].classList.remove('locked');
        }
        
        if (this.userProgress.lessonsCompleted >= 5) {
            achievements[3].classList.add('unlocked');
            achievements[3].classList.remove('locked');
        }
    }

    completeLesson(character) {
        this.userProgress.lessonsCompleted++;
        this.userProgress.availableSpins++;
        this.userProgress.points += 25;
        this.userProgress.completedLessons.push({
            character: character,
            date: new Date().toISOString(),
            points: 25
        });
        
        this.updateUI();
        this.saveProgress();
        this.checkAchievements();
        
        return true;
    }

    updateUI() {
        document.getElementById('points').textContent = this.userProgress.points;
        document.getElementById('level').textContent = this.userProgress.level;
        document.getElementById('spins').textContent = this.userProgress.spins;
        document.getElementById('lessons').textContent = this.userProgress.lessonsCompleted;
        
        const spinButton = document.getElementById('spinButton');
        spinButton.textContent = `Spin Wheel (${this.userProgress.availableSpins}/1)`;
        spinButton.disabled = this.userProgress.availableSpins < 1;
        
        this.updateProgressBars();
    }

    updateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach((bar, index) => {
            const lessonCount = this.userProgress.completedLessons.filter(
                lesson => lesson.character === ['peppa', 'mickey', 'paw', 'dora', 'spongebob'][index]
            ).length;
            bar.style.width = `${Math.min(lessonCount * 30, 100)}%`;
        });
    }

    initEventListeners() {
        document.getElementById('spinButton').addEventListener('click', () => {
            this.spinWheel();
        });
    }
}

let game;

function startLesson(character) {
    if (confirm(`Start learning with ${getCharacterName(character)}?`)) {
        setTimeout(() => {
            if (game.completeLesson(character)) {
                alert(`🎉 Congratulations! You completed the ${getCharacterName(character)} lesson!\n+25 points & +1 spin earned!`);
            }
        }, 1000);
    }
}

function getCharacterName(character) {
    const names = {
        'peppa': 'Peppa Pig',
        'mickey': 'Mickey Mouse', 
        'paw': 'Paw Patrol',
        'dora': 'Dora Explorer',
        'spongebob': 'SpongeBob'
    };
    return names[character] || character;
}

document.addEventListener('DOMContentLoaded', function() {
    game = new EnglishFortuneGame();
});
