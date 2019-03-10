export class FileLoader {
	static async loadAsText(filename: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open('GET', filename);
			xmlHttp.onreadystatechange = ev => {
				if (xmlHttp.readyState == 4) {
					if ((xmlHttp.status == 200) || (xmlHttp.status == 302)) {
						resolve(xmlHttp.responseText);
					} else {
						reject(`Failed to fetch resource. Returned with status code ${xmlHttp.status}`);
					}
				}
			};
			xmlHttp.send();
		});
	}
}