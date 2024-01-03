import { PropertyDefinition } from '@/model';
import { CaseSensitive, Database, Hash, Link2, List, MapPin } from 'lucide-react';
import { cn } from '@/ui/utils';

interface PropertyTypeIconProps {

  className?: string;

  definition: PropertyDefinition;

}

export const PropertyTypeIcon = (props: PropertyTypeIconProps) => {

  const { type } = props.definition;

  const className = props.className || '';

  return ( 
    <div className="inline-block">
      {type === 'text' ? (
        <CaseSensitive 
          className={cn('inline w-4.5 h-5 mt-[1px]', className)} />
      ) : type === 'number' ? (
        <Hash 
          className={cn('inline w-4.5 h-3.5 px-0.5', className)} />
      ) : type === 'enum' ? (
        <List 
          className={cn('inline w-4.5 h-3.5 px-0.5', className)} />
      ) : type === 'uri' ? (
        <Link2 
          className={cn('inline w-4.5 h-3.5 px-0.5', className)} />
      ) : type === 'geocoordinate' ? (
        <MapPin 
          className={cn('inline w-4.5 h-3.5 px-0.5', className)} />
      ) : type === 'external_authority' && (
        <Database
          className={cn('inline w-4.5 h-3.5 -mt-[2px] px-0.5', className)} />
      )}
    </div>
  )

}