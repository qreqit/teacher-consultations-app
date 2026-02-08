class Consultation {
    constructor(id, teacherName, topic, date, time, status, maxSlots) {
        this.id = id;
        this.teacherName = teacherName;
        this.topic = topic;
        this.date = date;
        this.time = time;
        this.status = status;
        this.maxSlots = maxSlots;
    }
}

module.exports = Consultation;
