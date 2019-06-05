var cluster = require('cluster');
var os = require('os');

var start_worker = () => {
    var worker = cluster.fork();
    // eslint-disable-next-line no-console
    console.log('CLUSTER : Worker %d started', worker.id);
}

if(cluster.isMaster){
    os.cpus().forEach(() => {
        start_worker();
    });

    //log any workers that disconnect; if a worker disconnects,
    //it should then exit, so we''l wait for the exit event to spawn
    //a new worker to replace it
    cluster.on('disconnect', (worker) => {
        // eslint-disable-next-line no-console
        console.log('CLUSTER : Worker %d disconnected from the cluster.', worker.id);
    });

    //when a worker dies (exits), create a worker to replace it
    cluster.on('exit', (worker, code, signal) => {
        // eslint-disable-next-line no-console
        console.log('CLUSTER : Worker %d died with exit code %d (%s)', worker.id, code, signal);
        start_worker();
    });
}else{
    //start our app on worker
    require('./meadowlark.js');
}