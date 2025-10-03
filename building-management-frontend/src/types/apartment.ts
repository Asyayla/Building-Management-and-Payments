export interface ApartmentDTO {
     id: number;
     block: string;
     floor: number;
     number: number;
     isOccupied: boolean;
     updating?: boolean;
   }
   
   export interface ApartmentCreateDTO {
     block: string;
     floor: number;
     number: number;
     isOccupied: boolean;
   }
   
   export interface ApartmentUpdateDTO extends ApartmentCreateDTO {}
   