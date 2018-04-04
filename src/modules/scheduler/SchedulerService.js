export const modifyEvent = (ev, event, scheduler) => {
	scheduler.editEvent(event);
};

export const removeEvent = (ev, event, scheduler) => {
	scheduler.removeEvent(event);
};