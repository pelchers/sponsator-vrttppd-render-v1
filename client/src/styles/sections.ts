export const sectionStyles = {
  base: `
    rounded-lg
    border-2
    border-black
    p-6
    transition-all
    duration-200
  `,
  variants: {
    spring: `
      bg-spring-light
      border-spring
    `,
    turquoise: `
      bg-turquoise-light
      border-turquoise
    `,
    orange: `
      bg-orange-light
      border-orange
    `,
    lemon: `
      bg-lemon-light
      border-lemon
    `,
    red: `
      bg-red-light
      border-red
    `,
    white: `
      bg-neutral-white
      border-neutral-200
    `,
    black: `
      bg-neutral-900
      text-white
      border-black
    `,
    ghost: `
      bg-transparent
      border-transparent
    `
  }
}

export const sectionHeaderStyles = {
  base: `
    flex 
    items-center 
    justify-between 
    mb-4
  `,
  title: {
    spring: `text-spring-dark font-semibold`,
    turquoise: `text-turquoise-dark font-semibold`,
    orange: `text-orange-dark font-semibold`,
    lemon: `text-lemon-dark font-semibold`,
    red: `text-red-dark font-semibold`,
    white: `text-neutral-900 font-semibold`,
    black: `text-white font-semibold`,
    ghost: `text-neutral-900 font-semibold`
  }
} 