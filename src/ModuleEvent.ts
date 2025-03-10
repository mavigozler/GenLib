"use strict";

export {
   ModuleEvent,
   EventSubject
};

class ModuleEvent {
   constructor(public data: unknown) {}
}

class EventSubject {
   private listeners: ((event: ModuleEvent) => void)[] = [];

   subscribe(listener: (event: ModuleEvent) => void) {
       this.listeners.push(listener);
   }

   trigger(data: unknown) {
       const event = new ModuleEvent(data);
       this.listeners.forEach(listener => listener(event));
   }
}
