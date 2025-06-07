const STORAGE_KEY = 'bezierRacerCompletedLevels';

function getCompletedLevels() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function markLevelAsCompleted(levelId) {
    const completed = getCompletedLevels();
    if (!completed.includes(levelId)) {
        completed.push(levelId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
        console.log(`Level ${levelId} marked as completed. All: ${completed}`);
    }
}

function isLevelUnlocked(levelId, allLevelsData) {
    const levelIndex = allLevelsData.findIndex(l => l.id === levelId);
    if (levelIndex === -1) return false; 
    if (levelIndex === 0) return true; 

    const previousLevelId = allLevelsData[levelIndex - 1].id;
    return getCompletedLevels().includes(previousLevelId);
}

function resetProgress() {
    localStorage.removeItem(STORAGE_KEY);
    console.log("Progress reset.");
}