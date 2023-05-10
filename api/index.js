import cluster from 'cluster'
import {fork} from 'child_process'

let newPID = 0;
let oldPID;
function init() {
	if (cluster.isMaster) {
		let worker = cluster.fork();
		newPID = worker.process.pid;
		console.log('worker ' + newPID + ' born.');

		cluster.on('exit', function (deadWorker, code, signal) {
			worker = cluster.fork();


			oldPID = deadWorker.process.pid;

			console.log('worker ' + oldPID + ' died.');
			console.log('worker ' + newPID + ' born.');
		});
	}
	else {
		// server code;
		const child = fork('./controller/master/master.controller');
		child.send('Start service');

		child.on('exit', () => {
			process.kill(newPID);
			init();
		});
	}
}