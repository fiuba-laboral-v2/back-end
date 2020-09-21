export const defaultTranslations = {
  userFields: [
    { key: "email", value: "Email" },
    { key: "name", value: "Nombre" },
    { key: "surname", value: "Apellido" }
  ],
  userEditFields: [
    { key: "name", value: "Nombre" },
    { key: "surname", value: "Apellido" }
  ],
  register: [
    { key: "registerAsCompany", value: "Registrarme como empresa" },
    { key: "registerAsApplicant", value: "Registrarme como alumno" }
  ],
  applicantList: [{ key: "title", value: "Postulantes" }],
  applicantProfileDetail: [
    { key: "edit", value: "Editar" },
    { key: "padron", value: "Padron" },
    { key: "capabilities", value: "Aptitudes" }
  ],
  applicantProfileTitle: [
    { key: "title", value: "Mi Perfil" },
    { key: "subtitle", value: "Así lo va a ver una empresa" }
  ],
  applicantSignUp: [
    { key: "title", value: "Crear tu cuenta" },
    { key: "padron", value: "Padron" },
    { key: "careersTitle", value: "Elegí tu carrera" },
    { key: "submit", value: "Guardar" }
  ],
  applicantCredentialsFields: [
    { key: "dni", value: "DNI" },
    { key: "password", value: "Contraseña" }
  ],
  careersSection: [{ key: "careersTitle", value: "Carreras" }],
  applicantOfferList: [
    { key: "title", value: "Ofertas de trabajo" },
    { key: "addFilters", value: "Agregar filtros" },
    { key: "careers", value: "Carreras" },
    { key: "filter", value: "Filtrar" }
  ],
  careersDetail: [
    { key: "approvedSubjectCount", value: "materias aprobadas" },
    { key: "currentCareerYear", value: "año" },
    { key: "isGraduate", value: "Graduado/a" },
    { key: "connector", value: "de" }
  ],
  careerSelector: [
    { key: "career", value: "Carrera" },
    { key: "isGraduate", value: "Graduado?" },
    { key: "approvedSubjectCount", value: "Materias aprobadas" },
    { key: "currentCareerYear", value: "Año en curso" },
    { key: "withoutCBC", value: "Sin incluir CBC" }
  ],
  targetApplicantTypeSelector: [
    { key: "title", value: "Destinatarios" },
    { key: "graduate", value: "Graduados" },
    { key: "student", value: "Alumnos" },
    { key: "both", value: "Alumnos y graduados" }
  ],
  editOffer: [
    { key: "create", value: "Publicar oferta" },
    { key: "edit", value: "Editar tu oferta" },
    { key: "offerTitle", value: "Título" },
    { key: "description", value: "Descripción" },
    { key: "hoursPerDay", value: "Horas por día" },
    { key: "minimumSalary", value: "Salario mínimo" },
    { key: "maximumSalary", value: "Salario máximo" },
    { key: "submit", value: "Publicar" },
    { key: "confirmDialogTitle", value: "¿Editar oferta?" },
    {
      key: "confirmDialogDescription",
      value: "La oferta tendrá que ser nuevamente aprobada para volver a ser visible"
    },
    { key: "confirmDialogCancel", value: "Cancelar" },
    { key: "confirmDialogConfirm", value: "Confirmar" }
  ],
  CompanyLogoInput: [{ key: "uploadLogo", value: "Subir logo" }],
  companyFields: [
    { key: "cuit", value: "CUIT" },
    { key: "email", value: "Email de la empresa" },
    { key: "companyName", value: "Nombre de la empresa" },
    { key: "businessName", value: "Razón social" },
    { key: "slogan", value: "Slogan" },
    { key: "description", value: "Descripción" },
    { key: "website", value: "Sitio" }
  ],
  editableCompanyProfile: [{ key: "edit", value: "Editar" }],
  editMyCompanyProfile: [
    { key: "title", value: "Editar el perfil de tu empresa" },
    { key: "submit", value: "Guardar" }
  ],
  companySignUp: [
    { key: "title", value: "Crear tu cuenta" },
    { key: "submit", value: "Guardar" }
  ],
  companyCredentialsFields: [
    { key: "password", value: "Contraseña" },
    { key: "passwordConfirm", value: "Confirmar contraseña" }
  ],
  companiesList: [{ key: "title", value: "Empresas" }],
  companyProfileTitle: [
    { key: "title", value: "Perfil de mi empresa" },
    { key: "subtitle", value: "Así lo van a ver los alumnos y graduados" }
  ],
  editableDetail: [
    { key: "title", value: "Editar tu perfil" },
    { key: "description", value: "Descripción" },
    { key: "links", value: "Links" },
    { key: "link", value: "Link" },
    { key: "linkTitle", value: "Título" },
    { key: "careers", value: "Carreras" },
    { key: "capabilities", value: "Aptitudes e Idiomas" },
    { key: "capability", value: "Aptitud (presione Enter para agregar)" },
    { key: "sections", value: "Secciones" },
    { key: "sectionTitle", value: "Título" },
    { key: "sectionContent", value: "Contenido" },
    { key: "submit", value: "Guardar" }
  ],
  login: [
    { key: "title", value: "Ingresar" },
    { key: "email", value: "Email" },
    { key: "password", value: "Contraseña" },
    { key: "logIn", value: "Iniciar sesión" },
    { key: "dontHaveAnAccount", value: "No tenés cuenta?" },
    { key: "register", value: "Registrate" },
    { key: "badCredentialsMessage", value: "Email o contraseña inválidos" }
  ],
  navBar: [
    { key: "applicants", value: "Postulantes" },
    { key: "companies", value: "Empresas" },
    { key: "jobOffers", value: "Ofertas de trabajo" },
    { key: "jobApplications", value: "Postulaciones" },
    { key: "createOffer", value: "Publicar Oferta" },
    { key: "signUp", value: "Crear tu cuenta" },
    { key: "tasks", value: "Tareas Pendientes" },
    { key: "logIn", value: "Iniciar sesión" },
    { key: "logOut", value: "Cerrar sesión" },
    { key: "myProfile", value: "Mi perfil" },
    { key: "myCompanyProfile", value: "Mi empresa" },
    { key: "myOffers", value: "Mis Ofertas" },
    { key: "pendingProfile", value: "Su perfil esta pendiente de aprobación" },
    { key: "rejectedProfile", value: "Su perfil ha sido rechazado" }
  ],
  offerCareer: [{ key: "careersTitle", value: "Carreras" }],
  offerDetail: [
    { key: "edit", value: "Editar" },
    { key: "apply", value: "Postularme" },
    { key: "applySuccess", value: "Postulación exitosa!" },
    { key: "alreadyApplied", value: "Ya te postulaste" }
  ],
  MyOffers: [{ key: "title", value: "Mis Ofertas" }],
  jobSpecs: [{ key: "timeDescription", value: "horas por día" }],
  offerSalary: [
    { key: "salaryFrom", value: "Desde" },
    { key: "salaryTo", value: "Hasta" },
    { key: "salaryTitle", value: "Salario Neto" }
  ],
  offerTargetApplicantType: [
    { key: "title", value: "Destinatarios" },
    { key: "graduate", value: "Graduados" },
    { key: "student", value: "Alumnos" },
    { key: "both", value: "Alumnos y graduados" }
  ],
  offerWorkload: [
    { key: "title", value: "Carga horaria" },
    { key: "hoursPerDay", value: "Horas por dia" }
  ],
  typeFilterMenu: [
    { key: "title", value: "Tipo" },
    { key: "companyIconTitle", value: "Empresas" },
    { key: "applicantIconTitle", value: "Postulantes" },
    { key: "offerIconTitle", value: "Ofertas" },
    { key: "jobApplicationIconTitle", value: "Postulaciones" }
  ],
  statusFilterMenu: [
    { key: "title", value: "Estado" },
    { key: "pending", value: "Pendientes" },
    { key: "approved", value: "Aprobados" },
    { key: "rejected", value: "Rechazados" }
  ],
  adminTaskList: [
    { key: "none", value: "Tareas" },
    { key: "approved", value: "Tareas aprobadas" },
    { key: "pending", value: "Tareas pendientes" },
    { key: "rejected", value: "Tareas rechazadas" },
    { key: "pending_or_rejected", value: "Tareas pendientes o rechazadas" },
    { key: "approved_or_pending", value: "Tareas aprobadas o pendientes" },
    { key: "approved_or_rejected", value: "Tareas aprobadas o rechazadas" },
    { key: "approved_or_pending_or_rejected", value: "Tareas" }
  ],
  adminEmptyDetail: [{ key: "selectToStart", value: "Seleccioná para comenzar" }],
  approvalActions: [
    { key: "approved", value: "Aprobado" },
    { key: "rejected", value: "Rechazado" },
    { key: "pending", value: "Pendiente" }
  ],
  adminCompanyMainTitle: [{ key: "title", value: "Empresa" }],
  adminCompanyListMainTitle: [{ key: "title", value: "Empresas" }],
  adminApplicantMainTitle: [{ key: "title", value: "Postulante" }],
  adminApplicantListMainTitle: [{ key: "title", value: "Postulantes" }],
  adminJobApplicationMainTitle: [{ key: "title", value: "Postulación" }],
  adminOfferMainTitle: [{ key: "title", value: "Oferta Laboral" }],
  adminOfferDetails: [{ key: "cuit", value: "CUIT de la empresa:" }],
  adminCompanyDetails: [{ key: "cuit", value: "CUIT:" }],
  adminApplicantDetails: [{ key: "padron", value: "Padrón:" }],
  adminActions: [
    { key: "approve", value: "Aprobar" },
    { key: "reject", value: "Rechazar" }
  ],
  adminApplicantListHeader: [
    { key: "names", value: "Nombre y Apellido" },
    { key: "padron", value: "Padrón" },
    { key: "dni", value: "DNI" },
    { key: "studies", value: "Estudios" },
    { key: "state", value: "Estado" }
  ],
  adminCompanyListHeader: [
    { key: "companyName", value: "Nombre" },
    { key: "businessName", value: "Razón social" },
    { key: "cuit", value: "CUIT" },
    { key: "state", value: "Estado" },
    { key: "updatedAt", value: "Última actualización" }
  ],
  statusLabel: [
    { key: "approved", value: "Aprobado" },
    { key: "rejected", value: "Rechazado" },
    { key: "pending", value: "Pendiente de aprobación" }
  ],
  separatedStatusLabel: [
    {
      key: "extensionTooltip",
      value: "Revisa la Secretaría de Extensión Universitaria y Bienestar Estudiantil"
    },
    {
      key: "graduadosTooltip",
      value: "Revisa la Subsecretaría de Relación con Graduados"
    },
    { key: "graduate", value: "Graduados" },
    { key: "student", value: "Alumnos" },
    { key: "approved", value: "Visible" },
    { key: "rejected", value: "No visible" },
    { key: "pending", value: "Pendiente" }
  ],
  desktopOnlyOverlay: [{ key: "message", value: "Ampliar la pantalla del navegador" }],
  publishedSince: [{ key: "prefix", value: "Publicado" }],
  list: [{ key: "fetchMore", value: "Ver más" }]
};
