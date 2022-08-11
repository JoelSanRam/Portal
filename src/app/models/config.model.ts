export interface IConfig {
  idOperador: string;
  redes_sociales: [
    {
      tipo: string;
      url: string;
    }
  ];
  anuncios: {
    AZAMID:{
      principal: string;
      izquierda: string;
      derecha: string;
    };
    AZALTM:{
      principal: string;
      izquierda: string;
      derecha: string;
    };
    AZABR:{
      principal: string;
      izquierda: string;
      derecha: string;
    };
    AZACR:{
      principal: string;
      izquierda: string;
      derecha: string;
    };
    AZAPTY:{
      principal: string;
      izquierda: string;
      derecha: string;
    };
    principal: string;
    izquierda: string;
    derecha: string;
  };
  lang:string;
  url_loader:string;
}
