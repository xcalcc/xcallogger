module.exports = {
    levels: {
        emerg: 0, //map to "fatal" which can cause process termination
        fatal: 0,
        alert: 1,
        crit: 2,
        error: 3,
        warning: 4,
        notice: 5,
        info: 6,
        debug: 7
    },
    levelColors: {
        emerg: 'magenta', //map to "fatal" which can cause process termination
        fatal: 'red',
        alert: 'magenta',
        crit: 'magenta',
        error: 'red',
        warning: 'yellow',
        notice: 'grey',
        info: 'green',
        debug: 'grey',
    },
}