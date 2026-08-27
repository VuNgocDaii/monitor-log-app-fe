interface Array<T> {
    getByName(name: string): T | undefined;
  }

  Array.prototype.getByName = function(name: string) {
    return this.find((item: any) => item.name === name);
  };
