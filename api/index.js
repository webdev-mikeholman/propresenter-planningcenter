import cluster from 'cluster'
import {fork} from 'child_process'

let newPID = 0;
let oldPID;
function init() {
	if (cluster.isPrimary) {
		let worker = cluster.fork();
		newPID = worker.process.pid;
		console.log('worker ' + newPID + ' born.');

		cluster.on('exit', function (deadWorker, code, signal) {
			worker = cluster.fork();


			oldPID = deadWorker.process.pid;

			if (newPID === oldPID) {
				worker.kill()
			}
			console.log('worker ' + oldPID + ' died.');
			console.log('worker ' + newPID + ' born.');
		});
	}
	else {
		try {
			// server code;
			const child = fork('./controller/master/master.controller');
			child.send('Start service');

			child.on('exit', () => {
				console.log('exited')
				process.kill(newPID);
				init();
			});
		} catch (e) {
			console.log('Error with child')
			console.log(e.message);
		}
	}
}

init()