// Insipired from https://github.com/zionsg/sgqr-parser

export class SGQRParser {
  static ROOT_DATA_OBJECTS_BY_ID = 'rootDataObjectsById';
  static INFO_TEMPLATE = 'infoTemplate';
  static TEMPLATES_BY_ID = 'templatesById';
  static ID = 'id';
  static NAME = 'name';
  static VALUE = 'value';
  static COMMENT = 'comment';
  static MAX_VALUE_LENGTH = 99;
  static DATA_OBJECTS_BY_ID = 'dataObjectsById';
  static IS_TEMPLATE = 'isTemplate';
  static USES_INFO_TEMPLATE = 'usesInfoTemplate';
  static DATA_OBJECTS = 'dataObjects';

  constructor(specs) {
    this.specs = specs || {
      [SGQRParser.ROOT_DATA_OBJECTS_BY_ID]: {},
      [SGQRParser.INFO_TEMPLATE]: {},
      [SGQRParser.TEMPLATES_BY_ID]: {}
    };
    this.infoTemplate = this.specs[SGQRParser.INFO_TEMPLATE];
  }

  parse(qrCode) {
    return this.extractDataObjects(qrCode);
  }

  assemble(dataObjects, isRecursiveCall = false) {
    let result = '';

    for (const dataObject of dataObjects) {
      const id = dataObject[SGQRParser.ID];
      let value = dataObject[SGQRParser.VALUE];
      const subDataObjects = dataObject[SGQRParser.DATA_OBJECTS];

      if (!id || (value === '' && !subDataObjects)) {
        throw new Error(`Invalid data object: ${JSON.stringify(dataObject)}`);
      }

      if (subDataObjects) {
        value = this.assemble(subDataObjects, true);
      }

      const length = value.length;
      if (length > SGQRParser.MAX_VALUE_LENGTH) {
        throw new Error(`Value cannot be more than ${SGQRParser.MAX_VALUE_LENGTH} characters: ${JSON.stringify(dataObject)}`);
      }

      const section = id + length.toString().padStart(2, '0') + value;
      if (!section) {
        throw new Error(`Could not assemble data object: ${JSON.stringify(dataObject)}`);
      }

      result += section;
    }

    if (!isRecursiveCall) {
      const resultWithoutChecksum = result.slice(0, -4);
      result = resultWithoutChecksum + this.computeChecksum(resultWithoutChecksum);
    }

    return result;
  }

  computeChecksum(text, polynomialHex = 0x1021, initialValue = 0xFFFF) {
    let result = initialValue;
    const length = text.length;

    if (length > 0) {
      for (let offset = 0; offset < length; offset++) {
        result ^= (text.charCodeAt(offset) << 8);
        for (let bitwise = 0; bitwise < 8; bitwise++) {
          if ((result <<= 1) & 0x10000) {
            result ^= polynomialHex;
          }
          result &= 0xFFFF;
        }
      }
    }

    return result.toString(16).toUpperCase().padStart(4, '0');
  }

  extractDataObjects(text, specs) {
    const result = [];

    if (!specs) {
      specs = this.specs[SGQRParser.ROOT_DATA_OBJECTS_BY_ID] || {};
    }

    let index = 0;
    while (index < text.length) {
      const id = text.substr(index, 2);
      const length = parseInt(text.substr(index + 2, 2), 10);
      const value = text.substr(index + 4, length);
      index += 4 + length;

      result.push(this.analyzeDataObject(id, length, value, (specs?.[id] || {})));
    }

    return result;
  }

  analyzeDataObject(id, length, value, specs) {
    specs = specs || {};

    const isTemplate = specs[SGQRParser.IS_TEMPLATE] || false;
    if (isTemplate) {
      specs = { ...specs, ...((this.specs[SGQRParser.TEMPLATES_BY_ID] || {})[id] || {}) };
    }

    const usesInfoTemplate = specs[SGQRParser.USES_INFO_TEMPLATE] || false;
    if (usesInfoTemplate) {
      specs[SGQRParser.DATA_OBJECTS_BY_ID] = this.infoTemplate;
    }

    const result = {
      id,
      name: (specs[SGQRParser.NAME] || ''),
      length,
      value,
      comment: specs[SGQRParser.COMMENT],
    };

    if (isTemplate) {
      result[SGQRParser.DATA_OBJECTS] = this.extractDataObjects(value, (specs[SGQRParser.DATA_OBJECTS_BY_ID] || {}));
    }

    return result;
  }
}

export const parseSGQR = (data) => {
  console.log("data", data)
  const parser = new SGQRParser();
  const parsedData = parser.parse(data);
  console.log(parsedData);
  
  return {
    rawData: JSON.stringify(parsedData),
    merchantId: parsedData.find(obj => obj.id === '59')?.value || '',
    amount: parsedData.find(obj => obj.id === '54')?.value || ''
  };
};
