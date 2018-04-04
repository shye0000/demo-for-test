import streamSaver from 'streamsaver';

const downloadFileFromReadableStream = (response, filename) => {
	const fileStream = streamSaver.createWriteStream(filename);
	const writer = fileStream.getWriter();
	const reader = response.body.getReader();

	const pump = () => reader.read()
		.then(({ value, done }) => {
			if (done) { writer.close();}
			else { writer.write(value).then(pump); }
		});

	pump();
};

export default downloadFileFromReadableStream;