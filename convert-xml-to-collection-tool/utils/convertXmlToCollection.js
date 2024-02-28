export function convertXmlToCollection(textXml, scenarioName) {
  const xmlFormatString = textXml.replaceAll("#", "");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlFormatString, "application/xml");
  const rootName = xmlDoc.querySelector("Name").textContent?.trim();
  const webApiListTag = xmlDoc.querySelectorAll("WebApiList");
  const webApis = webApiListTag[0]?.querySelectorAll("DarRepoWebApi");

  const items = [];
  webApis.forEach((element, index) => {
    const scenarioStepName = element.querySelector("Name")?.textContent?.trim();
    const indexOfStep = `00${index + 1}`.slice(-3);
    const name = `${indexOfStep}_${scenarioName}_${scenarioStepName}`;
    const method = element.querySelector("HttpMethod")?.textContent?.trim();
    const headers = [];
    const headerElm = element.querySelector("RequestHeader");
    const listHeaderElms = headerElm.querySelectorAll(
      "DarRepoWebApiRequestHeader"
    );
    listHeaderElms.forEach((headerElm) => {
      const key = headerElm.querySelector("Key")?.textContent?.trim();
      const value = headerElm.querySelector("Value")?.textContent?.trim();
      headers.push({
        key,
        value: value.replace(/\${(.*?)}/g, "{{$1}}"),
        type: "text",
      });
    });

    const body = element.querySelector("RequestBody")?.textContent;
    const rawUrl =
      element.querySelector("HttpUrl")?.textContent?.trim() || "INVALID_URL";
    const hostUrl = rawUrl.split("/")[0].replace(/\${(.*?)}/g, "{{$1}}");
    const path = rawUrl.split("/").splice(1);
    const description = element
      .querySelector("Description")
      ?.textContent?.trim();
    const expectElm = element.querySelector("Expect");
    const hasExpectCode =
      expectElm.querySelector("ExpectHttpCode")?.textContent?.trim() === "200";
    const checkStatusArr = [
      'pm.test("Status code is 200", function () {\r',
      "    pm.response.to.have.status(200);\r",
      "});\r",
    ];
    const expectValue = expectElm
      .querySelector("ExpectValue")
      ?.textContent?.trim();

    const checkExpectValueArr = [
      'pm.test("Response JSON matches expected JSON", function () {\r',
      `pm.expect(actualJson).to.eql(${expectValue});\r`,
      "});\r",
    ];

    const fetchVariableElm = element.querySelector("FetchVariables");
    const listConfigVariable = fetchVariableElm.querySelectorAll(
      "DarRepoWebApiFetchConfig"
    );
    const configSetVars = [...listConfigVariable]?.map((item) => {
      const configVarValue = item
        .querySelector("FetchDefine")
        ?.textContent?.trim()
        .replace("$", "");
      const fetchVariableKey = item
        .querySelector("FetchVariable")
        ?.textContent?.trim();
      const key = fetchVariableKey.replace(/\${(.*?)}/g, "$1");
      const init = `pm.environment.set(\"${key}\", actualJson${configVarValue});`;
      return init;
    });

    const item = {
      name,
      event: [
        {
          listen: "test",
          script: {
            exec: [
              ...((hasExpectCode ||
                expectValue ||
                [...listConfigVariable]?.length > 0) && [
                "var actualJson = pm.response.json();\r",
              ]),
              ...(hasExpectCode ? checkStatusArr : []),
              ...(expectValue ? checkExpectValueArr : []),
              ...([...listConfigVariable]?.length > 0 ? configSetVars : []),
            ],
            type: "text/javascript",
          },
        },
      ],
      request: {
        method,
        header: headers,
        body: {
          mode: "raw",
          raw: body.replace(/(\t)/g, "").replace(/\${(.*?)}/g, "{{$1}}"),
          options: {
            raw: {
              language: "json",
            },
          },
        },
        url: {
          raw: rawUrl.replace(/\${(.*?)}/g, "{{$1}}"),
          host: hostUrl,
          path,
        },
      },
      description,
    };
    items.push(item);
  });

  return {
    name: rootName,
    item: items,
  };
}
