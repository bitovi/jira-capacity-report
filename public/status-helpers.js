const inQAStatus = {"QA": true, "In QA": true};
const inDevStatus = {"In Development": true};
const inPartnerReviewStatus = {"Partner Review": true};
const inDoneStatus = {"Done": true};

const WIGGLE_ROOM = 0;


export function addStatusToRelease(release) {
	return {
		...release,
		status: getReleaseStatus(release),
		devStatus: getReleaseDevStatus(release),
		qaStatus: getReleaseQAStatus(release)
	}
}
function getReleaseStatus(release) {
	// if everything is complete
	if( release.initiatives.filter(i => i.status !== "complete").length === 0 ){
		return "complete"
	} else {
		return getInitiativeStatus(release);
	}
}
function getReleaseDevStatus(release) {
	return getInitiativeDevStatus(release)
}

export function addStatusToInitiative(initiative) {
	return {
		...initiative,
		status: getInitiativeStatus(initiative),
		devStatus: getInitiativeDevStatus(initiative)
	}
}

function getInitiativeStatus(initiative) {
	if(inDoneStatus[initiative.Status]) {
		return "complete"
	}
	return timedStatus(initiative.team);
}

function isStatusDevComplete(item) {
	return inQAStatus[item.Status] || isStatusQAComplete(item);
}
function isStatusQAComplete(item) {
	return inPartnerReviewStatus[item.Status] || inDoneStatus[item.Status]
}

function timedStatus(timedRecord) {
	if(!timedRecord.due) {
		return "unknown"
	} else if((+timedRecord.due) > WIGGLE_ROOM + (+timedRecord.dueLastPeriod)){
		return "behind";
	} else if(timedRecord.start > new Date()) {
		return "notstarted"
	}
	else {
		return "ontrack"
	}
}


function getReleaseQAStatus(release) {
	if(isStatusQAComplete(release)) {
		return "complete";
	}
	if(release.qa.length && release.qs.issues.every( epic =>  isStatusQAComplete(epic))) {
		console.warn("The dev epics for",release, "are complete, but the issue is not in UAT");
		return "complete"
	}
	return timedStatus(release.qa)
}

export function getInitiativeDevStatus(initiative) {
	// check if epic statuses are complete
	if(isStatusDevComplete(initiative)) {
		return "complete";
	}
	if(initiative.dev.length && initiative.dev.issues.every( epic =>  isStatusDevComplete(epic))) {
		console.warn("The dev epics for",initiative, "are complete, but the issue is not in QA");
		return "complete"
	}
	return timedStatus(initiative.dev)
}


export function getEpicStatus(epic) {
	if(inQAStatus[epic.Status] || inPartnerReviewStatus[epic.Status] || inDoneStatus[epic.Status]) {
		return "complete";
	} else if(!epic["Due date"] ){
		return "unknown"
	} else if( new Date(epic["Due date"]) > WIGGLE_ROOM + (+epic.dueLastPeriod) ){
		return "behind"
	} else {
		return "ontrack";
	}
}

export function addStatusToEpic(epic) {
	return {
		...epic,
		status: getEpicStatus(epic)
	};
}

export function getBusinessDatesCount(startDate, endDate) {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
        const dayOfWeek = curDate.getDay();
        if(dayOfWeek !== 0 && dayOfWeek !== 6) count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
}