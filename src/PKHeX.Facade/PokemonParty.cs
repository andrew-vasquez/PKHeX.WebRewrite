using PKHeX.Core;
using PKHeX.Facade.Abstractions;
using PKHeX.Facade.Pokemons;

namespace PKHeX.Facade;

public class PokemonParty(Game game) : IMutablePokemonCollection
{
    private readonly IList<PKM> _partyData = game.SaveFile.PartyData;
    public IList<Pokemon> Pokemons => _partyData
        .Select(pkm => new Pokemon(pkm, game))
        .ToList();

    public bool AddOnEmptySlot(Pokemon pokemon)
    {
        var openSlot = _partyData
            .Select((pkm, index) => new { pkm, index })
            .FirstOrDefault(entry => entry.pkm.Species == 0)?.index ?? -1;

        if (openSlot == -1) return false;

        game.SaveFile.SetPartySlotAtIndex(pokemon.Pkm, openSlot);
        Commit();

        return true;
    }

    public void Commit()
    {
        try
        {
            game.SaveFile.PartyData = _partyData;
        }
        catch (ArgumentOutOfRangeException e) when (e.Message == "Specified argument was out of the range of valid values. (Parameter 'index')")
        {
            // there's some weird bug in some versions, that setting party data goes beyond the boundaries
            // since the whole set mostly have executed, we consider it to still be a succeeded set operation
        }
    }

    public void AddOrUpdate(UniqueId id, Pokemon pokemon)
    {
        var existing = _partyData.FirstOrDefault(p => UniqueId.From(p).Equals(id));

        if (existing is null)
        {
            var added = AddOnEmptySlot(pokemon);
            if (!added) throw new InvalidOperationException("Party is full.");
            return;
        }
        
        var index = _partyData.IndexOf(existing);
        _partyData[index] = pokemon.Pkm;
        
        Commit();
    }
}
